import React from "react";

const About = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
    <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <h1 className="text-4xl font-bold mb-4 text-indigo-700">About CampusSync AI</h1>
      <p className="text-lg text-gray-700 mb-6">
        CampusSync AI is an AI-powered event management platform designed to enhance student engagement and streamline event organization for educational institutions. Our mission is to connect students and organizers, making campus life more vibrant, interactive, and data-driven.
      </p>
      <h2 className="text-2xl font-semibold mb-2 text-indigo-600">Key Features</h2>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Personalized event recommendations using machine learning</li>
        <li>Real-time event registration and feedback</li>
        <li>Organizer dashboards with analytics and sentiment insights</li>
        <li>"Students Like You" clustering for community building</li>
        <li>Modern, responsive UI for students and organizers</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-2 text-indigo-600">Our Vision</h2>
      <p className="text-gray-700 mb-4">
        We believe in empowering students and organizers with smart tools that foster engagement, collaboration, and growth. Whether you're looking to discover new interests or host impactful events, CampusSync AI is your trusted campus companion.
      </p>
      <p className="text-gray-500 text-sm">&copy; 2024 CampusSync AI. All rights reserved.</p>
    </div>
  </div>
);

export default About;
