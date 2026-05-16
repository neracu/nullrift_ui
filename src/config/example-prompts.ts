/**
 * Example Prompts Library
 * 
 * Curated collection of example prompts to help users get started
 * with component generation.
 */

export interface ExamplePrompt {
  id: string;
  category: 'form' | 'card' | 'modal' | 'layout' | 'data-display' | 'navigation' | 'feedback';
  title: string;
  prompt: string;
  description: string;
  tags: string[];
}

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  // Forms
  {
    id: 'login-form',
    category: 'form',
    title: 'Login Form',
    prompt: 'Create a login form with email and password fields, including validation for email format and password minimum length of 8 characters',
    description: 'A secure login form with email and password authentication',
    tags: ['authentication', 'validation', 'security']
  },
  {
    id: 'registration-form',
    category: 'form',
    title: 'User Registration',
    prompt: 'Build a user registration form with fields for username, email, password, confirm password, and a terms and conditions checkbox. Include password strength indicator',
    description: 'Complete registration form with password validation',
    tags: ['signup', 'validation', 'password']
  },
  {
    id: 'contact-form',
    category: 'form',
    title: 'Contact Form',
    prompt: 'Design a contact form with name, email, phone number, subject dropdown, and message textarea. Make all fields required except phone',
    description: 'Professional contact form for customer inquiries',
    tags: ['contact', 'communication', 'support']
  },
  {
    id: 'survey-form',
    category: 'form',
    title: 'Survey Form',
    prompt: 'Create a survey form with multiple choice questions, rating scales, and text feedback. Include questions about user satisfaction and feature requests',
    description: 'Interactive survey for collecting user feedback',
    tags: ['feedback', 'survey', 'ratings']
  },
  {
    id: 'payment-form',
    category: 'form',
    title: 'Payment Form',
    prompt: 'Build a payment form with card number, expiry date, CVV, cardholder name, and billing address fields. Include proper validation for credit card format',
    description: 'Secure payment form with card validation',
    tags: ['payment', 'checkout', 'ecommerce']
  },

  // Cards
  {
    id: 'product-card',
    category: 'card',
    title: 'Product Card',
    prompt: 'Create a product card with image, title, price, rating stars, short description, and an "Add to Cart" button. Use a modern e-commerce design',
    description: 'E-commerce product card with purchase action',
    tags: ['ecommerce', 'product', 'shopping']
  },
  {
    id: 'user-profile-card',
    category: 'card',
    title: 'User Profile Card',
    prompt: 'Design a user profile card with avatar, name, bio, location, social media links (Twitter, LinkedIn, GitHub), and a follow button',
    description: 'Social profile card with user information',
    tags: ['profile', 'social', 'user']
  },
  {
    id: 'blog-post-card',
    category: 'card',
    title: 'Blog Post Card',
    prompt: 'Build a blog post card with featured image, title, excerpt, author info, publish date, reading time, and tags. Include a "Read More" link',
    description: 'Blog post preview card for content listings',
    tags: ['blog', 'content', 'article']
  },
  {
    id: 'pricing-card',
    category: 'card',
    title: 'Pricing Card',
    prompt: 'Create a pricing card for a SaaS product with plan name, price, billing period, feature list with checkmarks, and a "Get Started" button. Highlight the most popular plan',
    description: 'Pricing tier card for subscription plans',
    tags: ['pricing', 'saas', 'subscription']
  },
  {
    id: 'testimonial-card',
    category: 'card',
    title: 'Testimonial Card',
    prompt: 'Design a testimonial card with customer quote, star rating, customer name, title, company, and photo. Use a clean, trustworthy design',
    description: 'Customer testimonial card for social proof',
    tags: ['testimonial', 'review', 'social-proof']
  },

  // Modals
  {
    id: 'delete-confirmation',
    category: 'modal',
    title: 'Delete Confirmation',
    prompt: 'Create a confirmation modal for delete actions with a warning message, item name display, "Cancel" and "Delete" buttons. Use red color for the delete button',
    description: 'Destructive action confirmation dialog',
    tags: ['confirmation', 'delete', 'warning']
  },
  {
    id: 'success-modal',
    category: 'modal',
    title: 'Success Modal',
    prompt: 'Build a success modal with a checkmark icon, success message, optional description, and a "Continue" button. Use green colors and celebratory design',
    description: 'Success feedback modal with positive messaging',
    tags: ['success', 'feedback', 'confirmation']
  },
  {
    id: 'form-modal',
    category: 'modal',
    title: 'Form Modal',
    prompt: 'Design a modal dialog for adding a new item with a form containing name, description, and category fields. Include "Cancel" and "Save" buttons',
    description: 'Modal with embedded form for data entry',
    tags: ['form', 'dialog', 'input']
  },
  {
    id: 'image-preview',
    category: 'modal',
    title: 'Image Preview',
    prompt: 'Create an image preview modal with full-size image display, close button, navigation arrows for gallery, and image caption',
    description: 'Lightbox modal for image viewing',
    tags: ['image', 'gallery', 'preview']
  },

  // Layouts
  {
    id: 'dashboard-layout',
    category: 'layout',
    title: 'Dashboard Layout',
    prompt: 'Build a dashboard layout with sidebar navigation, top header with user menu, main content area, and widget grid. Make it responsive for mobile',
    description: 'Complete dashboard layout structure',
    tags: ['dashboard', 'admin', 'layout']
  },
  {
    id: 'landing-section',
    category: 'layout',
    title: 'Landing Section',
    prompt: 'Create a hero section for a landing page with headline, subheadline, two CTA buttons, and a background image. Use modern, attention-grabbing design',
    description: 'Hero section for landing pages',
    tags: ['landing', 'hero', 'marketing']
  },
  {
    id: 'two-column-layout',
    category: 'layout',
    title: 'Two Column Layout',
    prompt: 'Design a two-column layout with a 2:1 ratio, where the left column contains main content and the right column has a sidebar with related items',
    description: 'Flexible two-column content layout',
    tags: ['layout', 'columns', 'responsive']
  },

  // Data Display
  {
    id: 'data-table',
    category: 'data-display',
    title: 'Data Table',
    prompt: 'Create a data table with sortable columns, row selection checkboxes, pagination, and search functionality. Include columns for ID, name, email, status, and actions',
    description: 'Interactive data table with sorting and filtering',
    tags: ['table', 'data', 'sorting']
  },
  {
    id: 'stats-grid',
    category: 'data-display',
    title: 'Statistics Grid',
    prompt: 'Build a statistics grid showing key metrics with numbers, labels, trend indicators (up/down arrows), and percentage changes. Display 4 metrics in a responsive grid',
    description: 'Dashboard statistics display',
    tags: ['stats', 'metrics', 'dashboard']
  },
  {
    id: 'timeline',
    category: 'data-display',
    title: 'Timeline',
    prompt: 'Design a vertical timeline component showing events with dates, titles, descriptions, and icons. Use alternating left/right layout for desktop',
    description: 'Event timeline for chronological data',
    tags: ['timeline', 'events', 'history']
  },

  // Navigation
  {
    id: 'navbar',
    category: 'navigation',
    title: 'Navigation Bar',
    prompt: 'Create a responsive navigation bar with logo, menu items, search bar, and user profile dropdown. Include mobile hamburger menu',
    description: 'Main navigation header component',
    tags: ['navbar', 'menu', 'navigation']
  },
  {
    id: 'sidebar',
    category: 'navigation',
    title: 'Sidebar Navigation',
    prompt: 'Build a collapsible sidebar navigation with icons, labels, nested menu items, and active state indicators. Include expand/collapse toggle',
    description: 'Vertical sidebar for app navigation',
    tags: ['sidebar', 'menu', 'navigation']
  },
  {
    id: 'breadcrumbs',
    category: 'navigation',
    title: 'Breadcrumbs',
    prompt: 'Design a breadcrumb navigation component showing the current page hierarchy with clickable links and separators',
    description: 'Breadcrumb trail for page hierarchy',
    tags: ['breadcrumbs', 'navigation', 'hierarchy']
  },

  // Feedback
  {
    id: 'toast-notification',
    category: 'feedback',
    title: 'Toast Notification',
    prompt: 'Create a toast notification component with success, error, warning, and info variants. Include icon, message, close button, and auto-dismiss after 5 seconds',
    description: 'Temporary notification toast',
    tags: ['toast', 'notification', 'alert']
  },
  {
    id: 'alert-banner',
    category: 'feedback',
    title: 'Alert Banner',
    prompt: 'Build an alert banner for important messages with different severity levels (info, warning, error, success). Include icon, message, and optional action button',
    description: 'Prominent alert banner for notifications',
    tags: ['alert', 'banner', 'notification']
  },
  {
    id: 'loading-spinner',
    category: 'feedback',
    title: 'Loading Spinner',
    prompt: 'Design a loading spinner component with animated circular progress, optional loading text, and different size variants (small, medium, large)',
    description: 'Loading indicator for async operations',
    tags: ['loading', 'spinner', 'progress']
  }
];

/**
 * Get prompts by category
 */
export function getPromptsByCategory(category: ExamplePrompt['category']): ExamplePrompt[] {
  return EXAMPLE_PROMPTS.filter(p => p.category === category);
}

/**
 * Get prompt by ID
 */
export function getPromptById(id: string): ExamplePrompt | undefined {
  return EXAMPLE_PROMPTS.find(p => p.id === id);
}

/**
 * Search prompts by query
 */
export function searchPrompts(query: string): ExamplePrompt[] {
  const lowerQuery = query.toLowerCase();
  return EXAMPLE_PROMPTS.filter(p =>
    p.title.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    p.prompt.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get random prompts
 */
export function getRandomPrompts(count: number = 3): ExamplePrompt[] {
  const shuffled = [...EXAMPLE_PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get categories with counts
 */
export function getCategoriesWithCounts(): Array<{ category: string; count: number }> {
  const counts = EXAMPLE_PROMPTS.reduce((acc, prompt) => {
    acc[prompt.category] = (acc[prompt.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts).map(([category, count]) => ({
    category,
    count
  }));
}

// Made with Bob