/**
 * @fileOverview A simple web crawler service to scrape text content from a website.
 */

/**
 * Fetches a website's HTML and extracts its visible text content.
 * @param domain The domain to scrape.
 * @returns The extracted text content or an error message.
 */
export async function scrapeWebsiteText(domain: string): Promise<{ content: string | null; error?: string }> {
    const url = `http://${domain}`;
    console.log(`Crawling website: ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(10000), // 10-second timeout
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch website with status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('text/html')) {
            throw new Error(`Invalid content type: ${contentType}`);
        }

        const html = await response.text();

        // Basic text extraction: remove scripts, styles, and collapse whitespace
        const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')   // Remove style tags
            .replace(/<[^>]+>/g, ' ')                        // Remove all other HTML tags
            .replace(/\s+/g, ' ')                           // Collapse whitespace
            .trim();

        return { content: textContent };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during crawling.';
        console.error(`Error crawling ${url}:`, errorMessage);
        return { content: null, error: `Could not crawl website: ${errorMessage}` };
    }
}
