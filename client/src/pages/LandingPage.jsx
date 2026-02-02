import { useState } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What is the QR Queue System?",
      answer: "The QR Queue System is a digital queueing solution designed for the IT Department Office. It allows students to join virtual queues for various concerns, track their position in real-time, and receive QR codes for verification. Faculty members can manage queues efficiently and update their availability status."
    },
    {
      question: "How do I join a queue?",
      answer: "First, register or log in to your student account. From your dashboard, click 'Join Queue', select your concern category (ID, OJT, Capstone, Staff/Admin, or Enrollment), provide a brief description, and submit. You'll receive a queue number and QR code immediately."
    },
    {
      question: "What are the different concern categories?",
      answer: "We have 5 categories: ID Concerns (student ID issues), OJT (on-the-job training inquiries), Capstone (thesis/project guidance), Staff/Admin (faculty and administrative matters), and Enrollment (registration and class concerns)."
    },
    {
      question: "How do I track my queue position?",
      answer: "After joining a queue, navigate to 'My Queue' from your dashboard. You'll see your current position, estimated wait time, and a live status indicator that updates every 5 seconds automatically."
    },
    {
      question: "What is the QR code for?",
      answer: "The QR code serves as your digital queue ticket. It contains your unique queue information and can be scanned by faculty or office staff to verify your position when it's your turn to be served."
    },
    {
      question: "Can I check faculty availability before joining a queue?",
      answer: "Yes! The dashboard has a 'Faculty Availability' section where you can search for faculty members by name, email, or specialization. You can see their current status (Available, Busy, or Offline) and office location."
    },
    {      question: "Can I still get help if a faculty member is marked offline?",
      answer: "Yes! While offline faculty are not actively monitoring the queue system, urgent concerns can still be accommodated through walk-in visits or manual processing at the faculty's discretion. Mark your concern as 'Urgent' when joining the queue."
    },
    {      question: "What if I need to leave the queue?",
      answer: "You can view your queue history from your dashboard. However, once you join a queue, staying in line is important. If you must leave, your position will be maintained until processed or removed by an administrator."
    },
    {
      question: "How often does the queue status update?",
      answer: "Queue positions and statuses update automatically every 5 seconds. Faculty availability updates every 10 seconds, ensuring you always have the most current information."
    },
    {
      question: "What's the difference between enrolled and non-enrolled students?",
      answer: "Both can use the system, but enrolled students may have priority for certain services like enrollment and registration concerns. Non-enrolled students can still access services for ID, OJT, and general inquiries."
    },
    {
      question: "Who can I contact for technical support?",
      answer: "For technical issues with the QR Queue System, please visit the IT Department Office during office hours or contact the system administrator through the Staff/Admin queue category."
    }
  ];

  const guidelines = [
    {
      title: "Registration & Login",
      icon: "👤",
      steps: [
        "Students and faculty must register with valid email addresses",
        "Choose the correct portal (Student or Faculty) when logging in",
        "Keep your credentials secure and do not share your account",
        "Students must indicate if they are enrolled or non-enrolled"
      ]
    },
    {
      title: "Joining a Queue",
      icon: "📋",
      steps: [
        "Select the appropriate concern category that matches your inquiry",
        "Provide a clear and concise description of your concern",
        "Join only ONE queue at a time to maintain system efficiency",
        "Save or screenshot your QR code for verification purposes",
        "Arrive at the office before or when it's your turn"
      ]
    },
    {
      title: "Queue Etiquette",
      icon: "⏰",
      steps: [
        "Respect your position and wait for your turn patiently",
        "Monitor your queue status regularly through the dashboard",
        "Be present when your number is called or you may forfeit your turn",
        "Do not abuse the system by creating multiple queue entries",
        "Allow 5-10 minutes for position updates to reflect accurately"
      ]
    },
    {
      title: "Faculty Availability",
      icon: "👨‍🏫",
      steps: [
        "Check faculty availability before joining subject-specific queues",
        "Status indicators: Green (Available), Yellow (Busy), Red (Offline)",
        "Respect faculty office hours and availability status",
        "Use the search function to find faculty by name or specialization",
        "Availability updates every 10 seconds automatically"
      ]
    },
    {
      title: "Office Hours",
      icon: "🕐",
      steps: [
        "IT Department Office hours: Monday-Friday, 8:00 AM - 5:00 PM",
        "Queue system is accessible 24/7 for joining queues",
        "Queues are processed during office hours only",
        "Weekend and holiday queues will be processed on the next business day",
        "Emergency concerns should be reported directly to the office"
      ]
    },
    {
      title: "Best Practices",
      icon: "✨",
      steps: [
        "Join queues during off-peak hours when possible (10 AM - 2 PM)",
        "Prepare necessary documents before your turn",
        "Use the queue history feature to track past inquiries",
        "Update your profile information to ensure accurate communication",
        "Provide feedback to help us improve the system"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  QR Queue System
                </h1>
                <p className="text-xs text-gray-600">IT Department</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/student-login"
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
              >
                Student Login
              </Link>
              <Link
                to="/faculty-login"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition shadow-md"
              >
                Faculty Login
              </Link>
              <Link
                to="/admin-login"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-slate-700 to-gray-800 rounded-lg hover:from-slate-800 hover:to-gray-900 transition shadow-md"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-8 transform hover:rotate-6 transition duration-300">
            <span className="text-6xl">🎯</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Welcome to the{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              QR Queue System
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A modern, efficient digital queueing solution for the IT Department Office. 
            Skip the physical lines and manage your time better.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/student-login"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transform transition hover:scale-105 shadow-xl"
            >
              Get Started as Student
            </Link>
            <Link
              to="/faculty-login"
              className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transform transition hover:scale-105 shadow-lg"
            >
              Faculty Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Use Our System?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience a seamless, efficient, and modern approach to queue management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Updates</h3>
              <p className="text-gray-600">
                Track your queue position with live updates every 5 seconds. Know exactly when it's your turn.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">QR Code Verification</h3>
              <p className="text-gray-600">
                Get a unique QR code for each queue entry. Fast, secure, and paperless verification.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Faculty Availability</h3>
              <p className="text-gray-600">
                Check faculty status in real-time. Search by name, specialization, and see office locations.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Queue Categories</h3>
              <p className="text-gray-600">
                Organized categories: ID, OJT, Capstone, Staff/Admin, and Enrollment for efficient service.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">📜</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Queue History</h3>
              <p className="text-gray-600">
                Access your complete queue history. Review past inquiries and track resolution status.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                JWT authentication and role-based access control ensure your data stays safe and private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guidelines Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Guidelines & Best Practices
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow these guidelines to make the most of the QR Queue System
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guidelines.map((guideline, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="text-5xl mb-4">{guideline.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{guideline.title}</h3>
                <ul className="space-y-3">
                  {guideline.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 text-sm">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about the QR Queue System
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-indigo-600 transform transition-transform flex-shrink-0 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join the modern queue system today and experience hassle-free service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/student-login"
                className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-xl hover:bg-indigo-50 transform transition hover:scale-105 shadow-lg"
              >
                Student Portal
              </Link>
              <Link
                to="/faculty-login"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-800 text-white text-lg font-semibold rounded-xl hover:bg-indigo-900 transform transition hover:scale-105 shadow-lg"
              >
                Faculty Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-bold">QR Queue System</h3>
              </div>
              <p className="text-gray-400">
                Modernizing queue management for the IT Department Office
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/student-login" className="hover:text-white transition">Student Login</Link></li>
                <li><Link to="/faculty-login" className="hover:text-white transition">Faculty Login</Link></li>
                <li><Link to="/admin-login" className="hover:text-white transition">Admin Login</Link></li>
                <li><a href="#faq" className="hover:text-white transition">FAQs</a></li>
                <li><a href="#guidelines" className="hover:text-white transition">Guidelines</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Office Hours</h4>
              <p className="text-gray-400">
                Monday - Friday<br />
                8:00 AM - 5:00 PM<br />
                IT Department Office
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 IT Department. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
