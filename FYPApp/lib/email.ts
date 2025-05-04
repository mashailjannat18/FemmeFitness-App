import axios from 'axios';

export const sendConfirmationEmail = async (email: string, code: string): Promise<void> => {
  try {
    const response = await axios.post(
      'http://192.168.1.8:5000/api/send-confirmation-email', // Adjust for Android emulator
      { email, code },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`Confirmation code ${code} sent to ${email}`, response.data);
  } catch (error: any) {
    console.error('Error sending confirmation email:', error.response?.data || error.message);
    throw new Error('Failed to send confirmation email');
  }
};