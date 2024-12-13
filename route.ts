import { NextResponse } from 'next/server'
import { saveAttendanceData, saveSiteVisitData } from '@/utils/sheets'

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json()
    
    if (type === 'attendance') {
      // Convert time to attendance status
      const time = data[1] // Time from form
      const currentTime = new Date()
      const [hours, minutes] = time.split(':').map(Number)
      const submissionTime = new Date()
      submissionTime.setHours(hours, minutes)
      
      // Example attendance rules (adjust as needed):
      // P = Present (on time)
      // L = Late (more than 15 minutes late)
      // U = Unexcused absence (no submission)
      let status = 'P'
      if (submissionTime.getHours() > 9 || (submissionTime.getHours() === 9 && submissionTime.getMinutes() > 15)) {
        status = 'L'
      }
      
      const attendanceData = [data[0], data[1], status] // name, time, status
      const result = await saveAttendanceData(attendanceData)
      return NextResponse.json(result)
    } else if (type === 'site-visit') {
      const result = await saveSiteVisitData(data)
      return NextResponse.json(result)
    }
    
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error in attendance API:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

