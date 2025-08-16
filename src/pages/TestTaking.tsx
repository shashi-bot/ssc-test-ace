import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Clock, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export default function TestTaking() {
  const { attemptId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())

  // Fetch test attempt details
  const { data: testAttempt, isLoading: attemptLoading } = useQuery({
    queryKey: ['test-attempt', attemptId],
    queryFn: async () => {
      if (!attemptId || !user) return null
      
      const { data, error } = await supabase
        .from('test_attempts')
        .select(`
          *,
          tests (
            id,
            title,
            duration_minutes,
            total_questions,
            total_marks
          )
        `)
        .eq('id', attemptId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!attemptId && !!user
  })

  // Fetch test questions using regular query
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['test-questions', testAttempt?.test_id],
    queryFn: async () => {
      if (!testAttempt?.test_id || !user) return []
      
      const { data, error } = await supabase
        .from('test_questions')
        .select(`
          question_order,
          questions (*)
        `)
        .eq('test_id', testAttempt.test_id)
        .order('question_order')

      if (error) throw error
      return data?.map(item => item.questions).filter(Boolean) || []
    },
    enabled: !!testAttempt?.test_id && !!user
  })

  // Fetch existing question attempts
  const { data: existingAnswers } = useQuery({
    queryKey: ['question-attempts', attemptId],
    queryFn: async () => {
      if (!attemptId || !user) return []
      
      const { data, error } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('test_attempt_id', attemptId)

      if (error) throw error
      return data || []
    },
    enabled: !!attemptId && !!user
  })

  // Initialize answers from existing attempts
  useEffect(() => {
    if (existingAnswers?.length) {
      const answerMap: Record<string, string> = {}
      const reviewSet = new Set<string>()
      
      existingAnswers.forEach(attempt => {
        if (attempt.selected_answer) {
          answerMap[attempt.question_id] = attempt.selected_answer
        }
        if (attempt.attempt_status === 'MARKED_FOR_REVIEW') {
          reviewSet.add(attempt.question_id)
        }
      })
      
      setAnswers(answerMap)
      setMarkedForReview(reviewSet)
    }
  }, [existingAnswers])

  // Initialize timer
  useEffect(() => {
    if (testAttempt && !testAttempt.is_completed) {
      const startTime = new Date(testAttempt.started_at).getTime()
      const durationMs = testAttempt.tests.duration_minutes * 60 * 1000
      const endTime = startTime + durationMs
      const now = Date.now()
      
      const remaining = Math.max(0, endTime - now)
      setTimeRemaining(Math.floor(remaining / 1000))
    }
  }, [testAttempt])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && testAttempt && !testAttempt.is_completed) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, testAttempt])

  // Save answer mutation
  const saveAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer, status }: { 
      questionId: string
      answer?: string
      status: 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'NOT_ATTEMPTED' 
    }) => {
      if (!attemptId || !user) throw new Error('Missing required data')

      const { error } = await supabase
        .from('question_attempts')
        .upsert({
          test_attempt_id: attemptId,
          question_id: questionId,
          selected_answer: answer || null,
          attempt_status: status,
          time_spent: 0 // You could track time per question
        })

      if (error) throw error
    },
    onError: (error) => {
      console.error('Error saving answer:', error)
      toast.error('Failed to save answer')
    }
  })

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId || !user) throw new Error('Missing required data')

      // Calculate score (simplified - you might want more complex scoring)
      let totalScore = 0
      let correctAnswers = 0

      if (questions) {
        questions.forEach(question => {
          const userAnswer = answers[question.id]
          if (userAnswer === question.correct_answer) {
            correctAnswers++
            totalScore += question.marks || 1
          } else if (userAnswer) {
            // Apply negative marking
            totalScore -= question.negative_marks || 0.25
          }
        })
      }

      const percentage = testAttempt?.tests.total_marks 
        ? Math.max(0, (totalScore / testAttempt.tests.total_marks) * 100)
        : 0

      const { error } = await supabase
        .from('test_attempts')
        .update({
          is_completed: true,
          submitted_at: new Date().toISOString(),
          total_score: Math.max(0, totalScore),
          percentage: Math.round(percentage * 100) / 100,
          duration_taken: testAttempt ? 
            testAttempt.tests.duration_minutes - Math.floor(timeRemaining / 60) 
            : 0
        })
        .eq('id', attemptId)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Test submitted successfully!')
      navigate('/analytics')
    },
    onError: (error) => {
      console.error('Error submitting test:', error)
      toast.error('Failed to submit test')
    }
  })

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    saveAnswerMutation.mutate({ 
      questionId, 
      answer, 
      status: 'ANSWERED' 
    })
  }

  const handleMarkForReview = (questionId: string) => {
    const newMarked = new Set(markedForReview)
    if (newMarked.has(questionId)) {
      newMarked.delete(questionId)
    } else {
      newMarked.add(questionId)
    }
    setMarkedForReview(newMarked)

    saveAnswerMutation.mutate({ 
      questionId, 
      answer: answers[questionId], 
      status: newMarked.has(questionId) ? 'MARKED_FOR_REVIEW' : 
              answers[questionId] ? 'ANSWERED' : 'NOT_ATTEMPTED'
    })
  }

  const handleSubmitTest = () => {
    submitTestMutation.mutate()
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (attemptLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    )
  }

  if (!testAttempt || !questions?.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Test Not Found</h1>
          <p className="text-muted-foreground mb-4">The test could not be loaded</p>
          <Button onClick={() => navigate('/tests')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  if (testAttempt.is_completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Test Completed</h1>
          <p className="text-muted-foreground mb-4">You have already completed this test</p>
          <Button onClick={() => navigate('/analytics')}>
            View Results
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const getQuestionStatus = (questionId: string) => {
    if (markedForReview.has(questionId)) return 'review'
    if (answers[questionId]) return 'answered'
    return 'not-attempted'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">{testAttempt.tests.title}</h1>
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? 'text-destructive font-bold' : 'text-foreground'}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Submit Test
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit the test? This action cannot be undone.
                      <br /><br />
                      Answered: {Object.keys(answers).length} / {questions.length}
                      <br />
                      Marked for Review: {markedForReview.size}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleSubmitTest}
                      disabled={submitTestMutation.isPending}
                    >
                      {submitTestMutation.isPending ? 'Submitting...' : 'Submit Test'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <Progress value={progress} className="mt-4" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {currentQuestion.marks || 1} mark{(currentQuestion.marks || 1) > 1 ? 's' : ''}
                    </Badge>
                    {currentQuestion.negative_marks && (
                      <Badge variant="destructive">
                        -{currentQuestion.negative_marks} negative
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-base leading-relaxed">
                    {user?.user_metadata?.language_preference === 'HINDI' && currentQuestion.question_text_hindi
                      ? currentQuestion.question_text_hindi
                      : currentQuestion.question_text_english
                    }
                  </p>
                  {currentQuestion.image_url && (
                    <img 
                      src={currentQuestion.image_url} 
                      alt="Question illustration"
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>

                <RadioGroup
                  value={answers[currentQuestion.id] || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                >
                  <div className="space-y-3">
                    {[
                      { key: 'A', text: user?.user_metadata?.language_preference === 'HINDI' && currentQuestion.option_a_hindi ? currentQuestion.option_a_hindi : currentQuestion.option_a_english },
                      { key: 'B', text: user?.user_metadata?.language_preference === 'HINDI' && currentQuestion.option_b_hindi ? currentQuestion.option_b_hindi : currentQuestion.option_b_english },
                      { key: 'C', text: user?.user_metadata?.language_preference === 'HINDI' && currentQuestion.option_c_hindi ? currentQuestion.option_c_hindi : currentQuestion.option_c_english },
                      { key: 'D', text: user?.user_metadata?.language_preference === 'HINDI' && currentQuestion.option_d_hindi ? currentQuestion.option_d_hindi : currentQuestion.option_d_english }
                    ].filter(option => option.text).map(option => (
                      <div key={option.key} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value={option.key} id={option.key} />
                        <Label htmlFor={option.key} className="flex-1 cursor-pointer">
                          <span className="font-medium mr-2">({option.key})</span>
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleMarkForReview(currentQuestion.id)}
                      className={markedForReview.has(currentQuestion.id) ? 'bg-warning text-warning-foreground' : ''}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      {markedForReview.has(currentQuestion.id) ? 'Unmark' : 'Mark for Review'}
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentQuestionIndex === questions.length - 1}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Question Navigator</CardTitle>
                <CardDescription>
                  Click on question numbers to navigate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {questions.map((question, index) => {
                    const status = getQuestionStatus(question.id)
                    return (
                      <Button
                        key={question.id}
                        variant={index === currentQuestionIndex ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 p-0 text-xs ${
                          status === 'answered' ? 'bg-success text-success-foreground' :
                          status === 'review' ? 'bg-warning text-warning-foreground' :
                          'bg-muted'
                        }`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </Button>
                    )
                  })}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-success rounded"></div>
                    <span>Answered ({Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-warning rounded"></div>
                    <span>Marked for Review ({markedForReview.size})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded"></div>
                    <span>Not Attempted ({questions.length - Object.keys(answers).length})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}