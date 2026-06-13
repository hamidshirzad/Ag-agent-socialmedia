// Crawlee - web scraping and browser automation library (Read more at https://crawlee.dev)
import { CheerioCrawler } from '@crawlee/cheerio';
// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/)
import { Actor, log } from 'apify';

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
import { router } from './routes.js';

// The init() call configures the Actor to correctly work with the Apify-provided environment - mainly the storage infrastructure. It is necessary that every Actor performs an init() call.
await Actor.init();

const MAX_REQUESTS_PER_CRAWL_LIMIT = 10000;
const MAX_START_URLS = 1000;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const rawInput = (await Actor.getInput()) ?? {};

// Validate maxRequestsPerCrawl: must be a positive integer within a sane upper bound.
let { maxRequestsPerCrawl = 100 } = rawInput;
if (!Number.isInteger(maxRequestsPerCrawl) || maxRequestsPerCrawl <= 0) {
    log.warning(`Invalid maxRequestsPerCrawl "${rawInput.maxRequestsPerCrawl}", falling back to default of 100.`);
    maxRequestsPerCrawl = 100;
} else if (maxRequestsPerCrawl > MAX_REQUESTS_PER_CRAWL_LIMIT) {
    log.warning(`maxRequestsPerCrawl ${maxRequestsPerCrawl} exceeds the limit, capping at ${MAX_REQUESTS_PER_CRAWL_LIMIT}.`);
    maxRequestsPerCrawl = MAX_REQUESTS_PER_CRAWL_LIMIT;
}

// Validate startUrls: must be a non-empty array of http(s) URLs (string or { url } entries).
const rawStartUrls = Array.isArray(rawInput.startUrls) ? rawInput.startUrls : ['https://apify.com'];
const startUrls = [];
for (const entry of rawStartUrls.slice(0, MAX_START_URLS)) {
    const urlString = typeof entry === 'string' ? entry : entry?.url;
    if (typeof urlString !== 'string') {
        log.warning(`Skipping invalid startUrls entry: ${JSON.stringify(entry)}`);
        continue;
    }
    let parsed;
    try {
        parsed = new URL(urlString);
    } catch {
        log.warning(`Skipping startUrls entry with invalid URL: ${urlString}`);
        continue;
    }
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
        log.warning(`Skipping startUrls entry with unsupported protocol: ${urlString}`);
        continue;
    }
    startUrls.push(typeof entry === 'string' ? { url: urlString } : entry);
}

if (startUrls.length === 0) {
    throw new Error('No valid start URLs provided. Please supply at least one http(s) URL in startUrls.');
}

// Proxy configuration to rotate IP addresses and prevent blocking (https://docs.apify.com/platform/proxy)
// `checkAccess` flag ensures the proxy credentials are valid, but the check can take a few hundred milliseconds.
// Disable it for short runs if you are sure your proxy configuration is correct
const proxyConfiguration = await Actor.createProxyConfiguration({ checkAccess: true });

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: router,
});

await crawler.run(startUrls);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
