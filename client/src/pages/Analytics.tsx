import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/Layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Line, LineChart, Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export default function Analytics() {
  const { user } = useAuth()

  // Fetch user's test attempts with details
  const { data: testAttempts } = useQuery({
    queryKey: ['analytics-attempts', user?.id],
    queryFn: async () => {
      if (!user) return []
      
      const { data, error } = await supabase
        .from('test_attempts')
        .select(`
          *,
          tests (
            title,
            test_type,
            section,
            total_questions,
            total_marks
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('submitted_at', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user
  })

  // Calculate performance analytics
  const analytics = {
    totalTests: testAttempts?.length || 0,
    avgScore: testAttempts?.length 
      ? Math.round(testAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / testAttempts.length)
      : 0,
    bestScore: testAttempts?.length 
      ? Math.max(...testAttempts.map(a => a.percentage))
      : 0,
    totalTimeSpent: testAttempts?.reduce((acc, curr) => acc + (curr.duration_taken || 0), 0) || 0,
    improvement: testAttempts?.length >= 2 
      ? testAttempts[testAttempts.length - 1].percentage - testAttempts[0].percentage
      : 0
  }

  // Performance over time data
  const performanceData = testAttempts?.map((attempt, index) => ({
    test: index + 1,
    score: attempt.percentage,
    date: new Date(attempt.submitted_at!).toLocaleDateString(),
    testName: attempt.tests?.title?.substring(0, 15) + '...'
  })) || []

  // Section-wise performance
  const sectionPerformance = testAttempts?.reduce((acc: any, attempt) => {
    const section = attempt.tests?.section || 'General'
    if (!acc[section]) {
      acc[section] = { section, totalTests: 0, totalScore: 0, avgScore: 0 }
    }
    acc[section].totalTests += 1
    acc[section].totalScore += attempt.percentage
    acc[section].avgScore = Math.round(acc[section].totalScore / acc[section].totalTests)
    return acc
  }, {})

  const sectionData = Object.values(sectionPerformance || {}) as any[]

  // Test type distribution
  const testTypeData = testAttempts?.reduce((acc: any, attempt) => {
    const type = attempt.tests?.test_type || 'Other'
    const existingType = acc.find((item: any) => item.name === type)
    if (existingType) {
      existingType.value += 1
    } else {
      acc.push({ name: type, value: 1 })
    }
    return acc
  }, []) || []

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--info))', 'hsl(var(--success))']

  // Recent performance stats
  const recentStats = [
    {
      title: "Tests Completed",
      value: analytics.totalTests,
      icon: CheckCircle2,
      color: "text-success"
    },
    {
      title: "Average Score",
      value: `${analytics.avgScore}%`,
      icon: Target,
      color: "text-primary"
    },
    {
      title: "Best Performance",
      value: `${analytics.bestScore}%`,
      icon: Award,
      color: "text-accent"
    },
    {
      title: "Improvement",
      value: `${analytics.improvement > 0 ? '+' : ''}${Math.round(analytics.improvement)}%`,
      icon: TrendingUp,
      color: analytics.improvement >= 0 ? "text-success" : "text-destructive"
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Login</h1>
          <p className="text-muted-foreground">You need to login to view your analytics</p>
        </div>
      </div>
    )
  }

  if (analytics.totalTests === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Data Available</h1>
          <p className="text-muted-foreground">Complete some tests to see your analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Track your progress and identify areas for improvement
          </p>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {recentStats.map((stat, index) => (
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

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="performance">Performance Trend</TabsTrigger>
            <TabsTrigger value="sections">Section Analysis</TabsTrigger>
            <TabsTrigger value="distribution">Test Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Over Time
                </CardTitle>
                <CardDescription>
                  Track your score improvement across tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="test" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-card border rounded-lg p-3 shadow-lg">
                                <p className="font-medium">{data.testName}</p>
                                <p className="text-sm text-muted-foreground">{data.date}</p>
                                <p className="text-primary font-bold">{data.score}%</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Section-wise Performance
                  </CardTitle>
                  <CardDescription>
                    Your average scores across different sections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sectionData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="section" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-card border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium">{data.section}</p>
                                  <p className="text-primary font-bold">Average: {data.avgScore}%</p>
                                  <p className="text-sm text-muted-foreground">Tests: {data.totalTests}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar 
                          dataKey="avgScore" 
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Section Progress Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {sectionData.map((section, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{section.section}</CardTitle>
                      <Badge variant="outline">{section.totalTests} tests</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average Score</span>
                          <span className="font-semibold">{section.avgScore}%</span>
                        </div>
                        <Progress value={section.avgScore} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Test Type Distribution
                  </CardTitle>
                  <CardDescription>
                    Breakdown of tests by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={testTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {testTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Study Statistics
                  </CardTitle>
                  <CardDescription>
                    Your study time and practice summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Total Study Time</span>
                    <span className="font-bold">{Math.round(analytics.totalTimeSpent / 60)} hours</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Tests Completed</span>
                    <span className="font-bold">{analytics.totalTests}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Average Test Duration</span>
                    <span className="font-bold">
                      {analytics.totalTests > 0 
                        ? Math.round(analytics.totalTimeSpent / analytics.totalTests) 
                        : 0
                      } mins
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Performance Trend</span>
                    <Badge variant={analytics.improvement >= 0 ? "default" : "destructive"}>
                      {analytics.improvement >= 0 ? 'Improving' : 'Needs Focus'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}