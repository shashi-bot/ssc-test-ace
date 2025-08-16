import { useAuth } from '@/hooks/useApiAuth'
import { Header } from '@/components/Layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Award,
  ArrowRight,
  Play
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Index = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Question Bank",
      description: "Access 1000+ questions covering all SSC exam patterns"
    },
    {
      icon: Clock,
      title: "Timed Mock Tests",
      description: "Practice with real exam time constraints"
    },
    {
      icon: Target,
      title: "Detailed Analytics",
      description: "Track your performance with in-depth reports"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your improvement over time"
    },
    {
      icon: Users,
      title: "Leaderboards",
      description: "Compare your performance with other aspirants"
    },
    {
      icon: Award,
      title: "Instant Results",
      description: "Get immediate feedback after each test"
    }
  ]

  const testTypes = [
    {
      type: "Full Length Tests",
      description: "Complete SSC CGL/CHSL pattern tests",
      count: "5 Tests",
      color: "bg-primary"
    },
    {
      type: "Sectional Tests",
      description: "Focus on specific sections",
      count: "20 Tests",
      color: "bg-accent"
    },
    {
      type: "Chapter-wise Tests",
      description: "Topic-specific practice",
      count: "50+ Tests",
      color: "bg-info"
    },
    {
      type: "Previous Year Papers",
      description: "Actual exam questions",
      count: "10 Papers",
      color: "bg-success"
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6">
              🏆 India's Leading SSC Mock Test Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Master SSC Exams with
              <br />Smart Practice
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of successful SSC aspirants who cracked their exams using our 
              comprehensive mock test platform with detailed analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <Link to="/auth">
                  Start Free Practice 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  View Demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Test Types */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Practice Like Real Exam</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testTypes.map((test, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${test.color} flex items-center justify-center mb-3`}>
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{test.type}</CardTitle>
                    <Badge variant="outline" className="w-fit">{test.count}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{test.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Why Choose ExamDesk?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your SSC Journey?</h2>
            <p className="text-xl mb-6 opacity-90">
              Join 50,000+ aspirants who improved their scores with ExamDesk
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Continue your SSC preparation journey</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {testTypes.map((test, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${test.color} flex items-center justify-center mb-3`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{test.type}</CardTitle>
                <Badge variant="outline" className="w-fit">{test.count}</Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{test.description}</CardDescription>
                <Button className="w-full" asChild>
                  <Link to="/tests">Start Practice</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
};

export default Index;
