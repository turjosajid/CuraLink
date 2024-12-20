import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import axiosInstance from '../config/axios';
import './Dashboard.css';

const MedicalStudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesResponse, resourcesResponse] = await Promise.all([
          axiosInstance.get('/courses/student'),
          axiosInstance.get('/resources/medical')
        ]);
        setCourses(coursesResponse.data);
        setResources(resourcesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <Topbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Medical Student Dashboard</h1>
        </div>
        
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>My Courses</h2>
            <div className="card-content">
              {courses.length > 0 ? (
                <ul>
                  {courses.map(course => (
                    <li key={course.id}>
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <button className="primary-button">Continue Learning</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No courses enrolled yet.</p>
              )}
            </div>
          </div>

          <div className="dashboard-card">
            <h2>Learning Resources</h2>
            <div className="card-content">
              {resources.length > 0 ? (
                <ul>
                  {resources.map(resource => (
                    <li key={resource.id}>
                      <h3>{resource.title}</h3>
                      <p>{resource.type}</p>
                      <button className="secondary-button">Access Resource</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No resources available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalStudentDashboard;
