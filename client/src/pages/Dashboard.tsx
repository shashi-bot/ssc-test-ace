import { useAuth } from '@/hooks/useApiAuth'
import { Header } from '@/components/Layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Calendar,
  Play,
  CheckCircle2,
  XCircle,
  BarChart3
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export default function Dashboard() {
  const { user } = useAuth()

  // Fetch user's test attempts
  const { data: recentAttempts } = useQuery({
    queryKey: ['recent-attempts', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('test_attempts')
        .select(`
          id,
          started_at,
          is_completed,
          total_score,
          percentage,
          tests (
            title,
            total_questions
          )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    },
    enabled: !!user
  })

  // Calculate statistics
  const stats = {
    totalAttempts: recentAttempts?.length || 0,
    completed: recentAttempts?.filter(a => a.is_completed).length || 0,
    avgScore: recentAttempts?.length 
      ? Math.round(recentAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / recentAttempts.length)
      : 0,
    bestScore: recentAttempts?.length 
      ? Math.max(...recentAttempts.map(a => a.percentage || 0))
      : 0
  }

  const quickStats = [
    {
      title: "Tests Attempted",
      value: stats.totalAttempts,
      icon: BookOpen,
      color: "text-info"
    },
    {
      title: "Tests Completed", 
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-success"
    },
    {
      title: "Average Score",
      value: `${stats.avgScore}%`,
      icon: Target,
      color: "text-primary"
    },
    {
      title: "Best Score",
      value: `${stats.bestScore}%`,
      icon: TrendingUp,
      color: "text-accent"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.display_name || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            Track your progress and continue your SSC preparation journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Test Attempts
                </CardTitle>
                <CardDescription>
                  Your latest practice sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentAttempts?.length ? (
                  <div className="space-y-4">
                    {recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {attempt.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <XCircle className="h-5 w-5 text-warning" />
                          )}
                          <div>
                            <p className="font-medium">{attempt.tests?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {attempt.started_at ? new Date(attempt.started_at).toLocaleDateString() : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={attempt.is_completed ? "default" : "secondary"}>
                            {attempt.is_completed ? `${attempt.percentage}%` : 'In Progress'}
                          </Badge>
                          {attempt.is_completed && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {attempt.total_score} marks
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No test attempts yet</p>
                    <Button asChild>
                      <Link to="/tests">Start Your First Test</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress & Quick Actions */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span>{stats.totalAttempts ? Math.round((stats.completed / stats.totalAttempts) * 100) : 0}%</span>
                  </div>
                  <Progress value={stats.totalAttempts ? (stats.completed / stats.totalAttempts) * 100 : 0} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Performance</span>
                    <span>{stats.avgScore}%</span>
                  </div>
                  <Progress value={stats.avgScore} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/tests">
                    <Play className="mr-2 h-4 w-4" />
                    Start Mock Test
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profile">
                    <Target className="mr-2 h-4 w-4" />
                    Update Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}