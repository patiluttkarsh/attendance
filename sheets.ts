import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

const sheets = google.sheets({ version: 'v4', auth })
const SPREADSHEET_ID = '1A_vuxiNpaFRn05-9GFZu6EqNOLwtpt2-Z4vkj2ud9wg'

export async function saveAttendanceData(data: string[]) {
  try {
    // Format the date as MM/DD
    const today = new Date()
    const formattedDate = `${today.getMonth() + 1}/${today.getDate()}`
    
    // Find the current column for today's date
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:Z3', // Get header rows
    })
    
    const headers = response.data.values?.[2] || []
    const todayColumn = headers.findIndex((date) => date === formattedDate)
    
    if (todayColumn === -1) {
      throw new Error('Could not find today\'s date in the spreadsheet')
    }
    
    // Find the row for the student
    const studentResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:A', // Get all names
    })
    
    const names = studentResponse.data.values || []
    const studentRow = names.findIndex((row) => row[0] === data[0]) // data[0] is student name
    
    if (studentRow === -1) {
      throw new Error('Student not found in spreadsheet')
    }
    
    // Update the specific cell for today's attendance
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!${String.fromCharCode(65 + todayColumn)}${studentRow + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[data[2]]], // data[2] is attendance status (P/L/E/U)
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error saving to Google Sheets:', error)
    return { success: false, error }
  }
}

export async function saveSiteVisitData(data: string[]) {
  try {
    // Create Site Visits tab if it doesn't exist
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Site Visits',
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 26,
                  },
                },
              },
            },
          ],
        },
      })
      
      // Add headers if new sheet was created
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Site Visits!A1:D1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Driver Name', 'Location', 'Purpose', 'Visit Time']],
        },
      })
    } catch (error) {
      // Sheet probably already exists, continue
    }

    // Append the site visit data
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Site Visits!A:D',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [data], // [name, location, purpose, time]
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error saving site visit data:', error)
    return { success: false, error }
  }
}

