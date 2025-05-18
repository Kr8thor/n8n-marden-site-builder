// src/pages/ContactPage.jsx
import { ContactForm } from '../components/ContactForm';

function ContactPage() {
  return (
    <div className="contact-page">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      <div className="max-w-2xl mx-auto">
        <ContactForm />
      </div>
    </div>
  );
}

export default ContactPage;
