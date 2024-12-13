'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, Loader2, Clock, User } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type Attendance = {
  id: number
  name: string
  time: string
  type: 'in' | 'out'
}

type SiteVisit = {
  id: number
  driverName: string
  location: string
  purpose: string
  visitTime: string
}

export default function AttendanceTracker() {
  const [activeTab, setActiveTab] = useState<'in' | 'out' | 'site-visit'>('in')
  const [name, setName] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [purpose, setPurpose] = useState('')
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([])
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name && time) {
      setIsLoading(true)
      const newAttendance = {
        id: Date.now(),
        name,
        time,
        type: activeTab as 'in' | 'out'
      }
      try {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'attendance',
            data: [newAttendance.name, newAttendance.time, newAttendance.type]
          }),
        })
        const result = await response.json()
        if (result.success) {
          setAttendanceList([...attendanceList, newAttendance])
          setName('')
          setTime('')
          toast({
            title: "Success",
            description: "Attendance recorded successfully",
          })
        } else {
          throw new Error('Failed to save attendance')
        }
      } catch (error) {
        console.error('Error saving attendance:', error)
        toast({
          title: "Error",
          description: "Failed to record attendance",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSiteVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name && time && location && purpose) {
      setIsLoading(true)
      const newVisit = {
        id: Date.now(),
        driverName: name,
        location,
        purpose,
        visitTime: time
      }
      try {
        const response = await fetch('/api/attendance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'site-visit',
            data: [newVisit.driverName, newVisit.location, newVisit.purpose, newVisit.visitTime]
          }),
        })
        const result = await response.json()
        if (result.success) {
          setSiteVisits([...siteVisits, newVisit])
          setName('')
          setTime('')
          setLocation('')
          setPurpose('')
          toast({
            title: "Success",
            description: "Site visit recorded successfully",
          })
        } else {
          throw new Error('Failed to save site visit')
        }
      } catch (error) {
        console.error('Error saving site visit:', error)
        toast({
          title: "Error",
          description: "Failed to record site visit",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="backdrop-blur-sm bg-white/30">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Calendar className="mr-2" />
            Driver Tracker
          </CardTitle>
          <CardDescription className="text-blue-100">
            Attendance & Site Visit Management
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="in" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-14 items-stretch rounded-md bg-blue-100 p-1">
              <TabsTrigger value="in" onClick={() => setActiveTab('in')} className="data-[state=active]:bg-white">
                <Clock className="mr-2 h-4 w-4" />
                In Time
              </TabsTrigger>
              <TabsTrigger value="out" onClick={() => setActiveTab('out')} className="data-[state=active]:bg-white">
                <Clock className="mr-2 h-4 w-4" />
                Out Time
              </TabsTrigger>
              <TabsTrigger value="site-visit" onClick={() => setActiveTab('site-visit')} className="data-[state=active]:bg-white">
                <MapPin className="mr-2 h-4 w-4" />
                Site Visit
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="in">
              <AttendanceForm
                type="in"
                name={name}
                time={time}
                setName={setName}
                setTime={setTime}
                handleSubmit={handleAttendanceSubmit}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="out">
              <AttendanceForm
                type="out"
                name={name}
                time={time}
                setName={setName}
                setTime={setTime}
                handleSubmit={handleAttendanceSubmit}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="site-visit">
              <SiteVisitForm
                name={name}
                time={time}
                location={location}
                purpose={purpose}
                setName={setName}
                setTime={setTime}
                setLocation={setLocation}
                setPurpose={setPurpose}
                handleSubmit={handleSiteVisitSubmit}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gray-50 rounded-b-lg">
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4">Today's Records</h2>
            {activeTab !== 'site-visit' ? (
              <AttendanceList attendanceList={attendanceList} />
            ) : (
              <SiteVisitList siteVisits={siteVisits} />
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

type AttendanceFormProps = {
  type: 'in' | 'out'
  name: string
  time: string
  setName: (name: string) => void
  setTime: (time: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

function AttendanceForm({ type, name, time, setName, setTime, handleSubmit, isLoading }: AttendanceFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Driver Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            id="name"
            placeholder="Enter driver name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm font-medium text-gray-700">{type === 'in' ? 'In Time' : 'Out Time'}</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : (
          `Record ${type === 'in' ? 'In Time' : 'Out Time'}`
        )}
      </Button>
    </form>
  )
}

type AttendanceListProps = {
  attendanceList: Attendance[]
}

function AttendanceList({ attendanceList }: AttendanceListProps) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {attendanceList.map((attendance) => (
          <motion.div
            key={attendance.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-md ${
              attendance.type === 'in' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
            }`}
          >
            <p className="font-semibold text-gray-800">{attendance.name}</p>
            <p className="text-sm text-gray-600">
              {attendance.type === 'in' ? 'In Time: ' : 'Out Time: '}
              {attendance.time}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

type SiteVisitFormProps = {
  name: string
  time: string
  location: string
  purpose: string
  setName: (name: string) => void
  setTime: (time: string) => void
  setLocation: (location: string) => void
  setPurpose: (purpose: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

function SiteVisitForm({
  name,
  time,
  location,
  purpose,
  setName,
  setTime,
  setLocation,
  setPurpose,
  handleSubmit,
  isLoading
}: SiteVisitFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Driver Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            id="name"
            placeholder="Enter driver name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            id="location"
            placeholder="Enter visit location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="purpose" className="text-sm font-medium text-gray-700">Purpose of Visit</Label>
        <Input
          id="purpose"
          placeholder="Enter purpose of visit"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm font-medium text-gray-700>Visit Time</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="pl-10"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Recording...
          </>
        ) : 'Record Site Visit'}
      </Button>
    </form>
  )
}

type SiteVisitListProps = {
  siteVisits: SiteVisit[]
}

function SiteVisitList({ siteVisits }: SiteVisitListProps) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {siteVisits.map((visit) => (
          <motion.div
            key={visit.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-3 rounded-md bg-blue-100 border-l-4 border-blue-500"
          >
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 flex-shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold text-gray-800">{visit.driverName}</p>
                <p className="text-sm text-gray-600">Location: {visit.location}</p>
                <p className="text-sm text-gray-600">Purpose: {visit.purpose}</p>
                <p className="text-sm text-gray-600">Time: {visit.visitTime}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

