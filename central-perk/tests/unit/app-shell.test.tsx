import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import Page from '../../src/app/page';
import RootLayout, { metadata } from '../../src/app/layout';

describe('Next app shell', () => {
  it('exports expected metadata', () => {
    expect(metadata.title).toBe('System 3 Web');
    expect(metadata.description).toBe('System 3 starter app');
  });

  it('renders page content through app entry point', () => {
    render(<Page />);
    expect(screen.getByText('System 3 Web')).toBeInTheDocument();
  });

  it('renders root layout structure', () => {
    const child = <main>child content</main>;
    const layoutElement = RootLayout({ children: child }) as ReactElement;

    expect(layoutElement.type).toBe('html');
    expect(layoutElement.props.lang).toBe('en');

    const bodyElement = layoutElement.props.children as ReactElement;
    expect(bodyElement.type).toBe('body');
    expect(bodyElement.props.children).toBe(child);
  });
});