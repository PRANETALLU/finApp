import axios from 'axios';

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    console.log(username, email, password);

    const response = await axios.post('http://localhost:8080/api/auth/signup', {
      username,
      email,
      password,
    });

    // If the external API returns a non-2xx status code, throw an error
    if (response.status !== 201) {
      throw new Error(response.data.error || 'Error in external API');
    }

    // Return the success response
    return new Response(JSON.stringify(response.data), { status: 201 });
  } catch (error) {
    console.error('Error in signup route:', error.message);

    // If Axios throws an error, it may have a response attached
    const errorMessage = error.response?.data?.error || 'Signup failed';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
