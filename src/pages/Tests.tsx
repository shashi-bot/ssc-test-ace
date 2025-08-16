import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/Layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Play,
  Search,
  Filter,
  Star,
  CheckCircle2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export default function Tests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSection, setSelectedSection] = useState<string>('ALL')

  // Fetch available tests
  const { data: tests, isLoading } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  // Fetch user's test attempts to show completion status
  const { data: userAttempts } = useQuery({
    queryKey: ['user-attempts', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('test_attempts')
        .select('test_id, is_completed, percentage')
        .eq('user_id', user.id)

      if (error) throw error
      return data || []
    },
    enabled: !!user
  })

  const startTest = async (testId: string) => {
    if (!user) {
      toast.error('Please login to start the test')
      return
    }

    try {
      // Create a new test attempt
      const { data, error } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          test_id: testId,
          started_at: new Date().toISOString(),
          is_completed: false
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Test started successfully!')
      navigate(`/test/${data.id}`)
    } catch (error) {
      console.error('Error starting test:', error)
      toast.error('Failed to start test. Please try again.')
    }
  }

  // Filter tests based on search and section
  const filteredTests = tests?.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSection = selectedSection === 'ALL' || test.section === selectedSection
    return matchesSearch && matchesSection
  }) || []

  // Group tests by type
  const testsByType = {
    FULL_LENGTH: filteredTests.filter(t => t.test_type === 'FULL_LENGTH'),
    SECTIONAL: filteredTests.filter(t => t.test_type === 'SECTIONAL'),
    CHAPTER_WISE: filteredTests.filter(t => t.test_type === 'CHAPTER_WISE'),
    PREVIOUS_YEAR: filteredTests.filter(t => t.test_type === 'PREVIOUS_YEAR')
  }

  const getTestIcon = (testType: string) => {
    switch (testType) {
      case 'FULL_LENGTH': return <BookOpen className="h-5 w-5" />
      case 'SECTIONAL': return <Star className="h-5 w-5" />
      case 'CHAPTER_WISE': return <Users className="h-5 w-5" />
      case 'PREVIOUS_YEAR': return <CheckCircle2 className="h-5 w-5" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  const getCompletionStatus = (testId: string) => {
    const attempt = userAttempts?.find(a => a.test_id === testId && a.is_completed)
    return attempt ? { completed: true, score: attempt.percentage } : { completed: false }
  }

  const TestCard = ({ test }: { test: any }) => {
    const status = getCompletionStatus(test.id)
    
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getTestIcon(test.test_type)}
              <div>
                <CardTitle className="text-lg leading-tight">{test.title}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {test.exam_type?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            {status.completed && (
              <Badge variant="default">
                Completed: {status.score}%
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-2">
            {test.description}
          </CardDescription>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{test.total_questions} Questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{test.duration_minutes} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{test.total_marks} marks</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={() => startTest(test.id)}
            variant={status.completed ? "outline" : "default"}
          >
            <Play className="mr-2 h-4 w-4" />
            {status.completed ? 'Retake Test' : 'Start Test'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Login</h1>
          <p className="text-muted-foreground mb-4">You need to login to access mock tests</p>
          <Button asChild>
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mock Tests</h1>
          <p className="text-muted-foreground">
            Practice with exam-pattern tests to improve your performance
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sections</SelectItem>
              <SelectItem value="QUANTITATIVE_APTITUDE">Quantitative Aptitude</SelectItem>
              <SelectItem value="GENERAL_INTELLIGENCE">General Intelligence</SelectItem>
              <SelectItem value="ENGLISH_COMPREHENSION">English Comprehension</SelectItem>
              <SelectItem value="GENERAL_AWARENESS">General Awareness</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Categories */}
        <Tabs defaultValue="FULL_LENGTH" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="FULL_LENGTH">Full Length</TabsTrigger>
            <TabsTrigger value="SECTIONAL">Sectional</TabsTrigger>
            <TabsTrigger value="CHAPTER_WISE">Chapter-wise</TabsTrigger>
            <TabsTrigger value="PREVIOUS_YEAR">Previous Year</TabsTrigger>
          </TabsList>

          <TabsContent value="FULL_LENGTH">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testsByType.FULL_LENGTH.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="SECTIONAL">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testsByType.SECTIONAL.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="CHAPTER_WISE">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testsByType.CHAPTER_WISE.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="PREVIOUS_YEAR">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testsByType.PREVIOUS_YEAR.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading tests...</p>
          </div>
        )}

        {!isLoading && filteredTests.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tests found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedSection !== 'ALL' 
                ? 'Try adjusting your search or filters' 
                : 'Tests will be available soon'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}