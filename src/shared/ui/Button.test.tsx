import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByText('Click Me');
    expect(buttonElement).toBeInTheDocument();
  });

  test('handles onClick event', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    const buttonElement = screen.getByText('Click Me');
    fireEvent.click(buttonElement);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant classes correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    render(<Button variant="secondary">Secondary</Button>);
    render(<Button variant="danger">Danger</Button>);
    
    const primaryButton = screen.getByText('Primary');
    const secondaryButton = screen.getByText('Secondary');
    const dangerButton = screen.getByText('Danger');
    
    expect(primaryButton.classList.contains('primary')).toBe(true);
    expect(secondaryButton.classList.contains('secondary')).toBe(true);
    expect(dangerButton.classList.contains('danger')).toBe(true);
  });

  test('applies size classes correctly', () => {
    render(<Button size="small">Small</Button>);
    render(<Button size="medium">Medium</Button>);
    render(<Button size="large">Large</Button>);
    
    const smallButton = screen.getByText('Small');
    const mediumButton = screen.getByText('Medium');
    const largeButton = screen.getByText('Large');
    
    expect(smallButton.classList.contains('small')).toBe(true);
    expect(mediumButton.classList.contains('medium')).toBe(true);
    expect(largeButton.classList.contains('large')).toBe(true);
  });

  test('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    const buttonElement = screen.getByText('Disabled');
    expect(buttonElement).toBeDisabled();
  });

  test('shows loading state when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    
    const buttonElement = screen.getByText('Loading');
    expect(buttonElement.classList.contains('loading')).toBe(true);
    expect(buttonElement).toBeDisabled();
  });

  test('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    
    const buttonElement = screen.getByText('Full Width');
    expect(buttonElement.classList.contains('fullWidth')).toBe(true);
  });

  test('accepts and applies additional className', () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const buttonElement = screen.getByText('Custom');
    expect(buttonElement.classList.contains('custom-class')).toBe(true);
  });
});