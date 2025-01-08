import axios from 'axios';

export default async (req, res) => {
    const { userId } = req.query;

    try {
        const response = await axios.get(`http://localhost:8080/api/dashboard/${userId}`); // Update to your Spring Boot server URL
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dashboard data' });
    }
};
