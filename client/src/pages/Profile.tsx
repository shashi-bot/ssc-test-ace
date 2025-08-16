import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/Layout/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Globe,
  Camera,
  Save,
  CheckCircle2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export default function Profile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }
      
      return data
    },
    enabled: !!user
  })

  // Form state
  const [formData, setFormData] = useState<{
    display_name: string
    phone: string
    exam_preference: 'SSC_CGL' | 'SSC_CHSL' | 'SSC_MTS'
    language_preference: 'ENGLISH' | 'HINDI'
  }>({
    display_name: '',
    phone: '',
    exam_preference: 'SSC_CGL',
    language_preference: 'ENGLISH'
  })

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        exam_preference: profile.exam_preference || 'SSC_CGL',
        language_preference: profile.language_preference || 'ENGLISH'
      })
    }
  }, [profile])

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: data.display_name,
          phone: data.phone,
          exam_preference: data.exam_preference,
          language_preference: data.language_preference
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    },
    onError: (error) => {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(formData)
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Please Login</h1>
          <p className="text-muted-foreground">You need to login to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account information and exam preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile?.display_name || user?.user_metadata?.display_name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    disabled
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="mt-4">
                  {profile?.display_name || user?.user_metadata?.display_name || 'User'}
                </CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">
                    {profile?.exam_preference?.replace('_', ' ') || 'SSC CGL'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">
                    {profile?.language_preference || 'English'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and preferences
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => handleInputChange('display_name', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Exam Preferences</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="exam_preference">Exam Type</Label>
                        <Select
                          value={formData.exam_preference}
                          onValueChange={(value) => handleInputChange('exam_preference', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select exam type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SSC_CGL">SSC CGL</SelectItem>
                            <SelectItem value="SSC_CHSL">SSC CHSL</SelectItem>
                            <SelectItem value="SSC_MTS">SSC MTS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language_preference">Language Preference</Label>
                        <Select
                          value={formData.language_preference}
                          onValueChange={(value) => handleInputChange('language_preference', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ENGLISH">English</SelectItem>
                            <SelectItem value="HINDI">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false)
                          // Reset form data
                          if (profile) {
                            setFormData({
                              display_name: profile.display_name || '',
                              phone: profile.phone || '',
                              exam_preference: profile.exam_preference || 'SSC_CGL',
                              language_preference: profile.language_preference || 'ENGLISH'
                            })
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}