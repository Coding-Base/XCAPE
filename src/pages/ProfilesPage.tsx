import React from 'react'
import { useParams } from 'react-router-dom'
import { Box, Container, Typography, Card, CardContent, Grid, Avatar, Chip, Divider } from '@mui/material'
import {
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
} from '@mui/icons-material'

interface Profile {
  id: string
  name: string
  role: string
  image: string
  qualification: string
  bio: string
  achievement: string
  contact: string
  address: string
  department?: string
}

const teamMembers: Profile[] = [
  {
    id: '1',
    name: 'Osimi Godsgift Gbubemi',
    role: 'Developer & Project Lead',
    image: 'OG',
    qualification: 'B.Eng (Petroleum Engineering) - Final Year',
    bio: 'Computer science + petroleum engineering enthusiast dedicated to making reservoir simulation accessible to students.',
    achievement: 'Led development of XCAPE platform integrating OPM Flow with advanced ML algorithms',
    contact: 'osimi@xcape-simulator.com',
    address: 'Nigeria',
    department: 'Petroleum Engineering',
  },
]

const contributors: Profile[] = [
  {
    id: '2',
    name: 'Dr Chikwe',
    role: 'Project Supervisor',
    image: 'DC',
    qualification: 'PhD in Petroleum Engineering',
    bio: 'Experienced petroleum engineer with focus on reservoir simulation and data analytics.',
    achievement: 'Published 20+ papers on reservoir modeling and assisted students in final year projects',
    contact: 'dr.chikwe@university.edu',
    address: 'Nigeria',
    department: 'Petroleum Engineering',
  },
]

const ProfilesPage: React.FC = () => {
  const { section } = useParams<{ section: string }>()
  const isTeam = section === 'team'
  const profiles = isTeam ? teamMembers : contributors

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Typography
          variant="h3"
          sx={{
            mb: 2,
            textAlign: 'center',
            fontWeight: 700,
            color: '#0F4C81',
            textTransform: 'capitalize',
          }}
        >
          {isTeam ? 'Development Team' : 'Contributors & Supervisors'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: 'center',
            color: 'textSecondary',
            mb: 6,
            fontSize: '1.1rem',
          }}
        >
          Meet the talented individuals behind XCAPE
        </Typography>

        <Grid container spacing={4}>
          {profiles.map((profile) => (
            <Grid item xs={12} sm={6} md={4} key={profile.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  {/* Avatar */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        mx: 'auto',
                        fontSize: '3rem',
                        backgroundColor: '#0F4C81',
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {profile.image}
                    </Avatar>
                  </Box>

                  {/* Name & Role */}
                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 1 }}>
                    {profile.name}
                  </Typography>
                  <Chip
                    icon={<WorkIcon />}
                    label={profile.role}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ display: 'block', mx: 'auto', mb: 3 }}
                  />

                  <Divider sx={{ my: 2 }} />

                  {/* Qualification */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: '#0F4C81', mb: 0.5 }}
                    >
                      <SchoolIcon sx={{ fontSize: '1rem', mr: 0.5, mb: '-2px' }} />
                      Qualification
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {profile.qualification}
                    </Typography>
                  </Box>

                  {/* Bio */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F4C81', mb: 0.5 }}>
                      Bio
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.5 }}>
                      {profile.bio}
                    </Typography>
                  </Box>

                  {/* Achievement */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F4C81', mb: 0.5 }}>
                      <StarIcon sx={{ fontSize: '1rem', mr: 0.5, mb: '-2px' }} />
                      Key Achievement
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.5 }}>
                      {profile.achievement}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Contact & Location */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon sx={{ fontSize: '1rem', color: '#0F4C81' }} />
                      <span style={{ wordBreak: 'break-all' }}>{profile.contact}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon sx={{ fontSize: '1rem', color: '#0F4C81' }} />
                      {profile.address}
                    </Typography>
                    {profile.department && (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon sx={{ fontSize: '1rem', color: '#0F4C81' }} />
                        {profile.department}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}

export default ProfilesPage
