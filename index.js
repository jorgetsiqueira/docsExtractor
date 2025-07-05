// index.js
// Objective: Extract HTML from URLs and convert to Markdown with GPT-4o-mini optimization
// Load environment variables
require('dotenv').config();

const axios = require('axios');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');
const ChatGPTService = require('./chatGPT');

// Configuration - load from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file');
    process.exit(1);
}

const chatGPT = new ChatGPTService(OPENAI_API_KEY);

// Directory configuration
const DIRS = {
    raw: path.join(__dirname, 'output', 'raw'),
    clean: path.join(__dirname, 'output', 'clean'),
    reports: path.join(__dirname, 'output', 'reports')
};

/**
 * Creates the necessary directory structure
 */
function createDirectories() {
    Object.values(DIRS).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

/**
 * Generates a clean filename from URL
 * @param {string} url - The source URL
 * @returns {string} - Clean filename
 */
function generateFileName(url) {
    const urlObj = new URL(url);
    let fileName = urlObj.hostname + urlObj.pathname.replace(/\/+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_');
    if (!fileName || fileName === urlObj.hostname) fileName += '_index';
    return fileName;
}

/**
 * Extracts HTML from URL and converts to optimized Markdown
 * @param {string} url - The URL to extract content from
 * @returns {Object} - Processing results with paths and content
 */
async function extractToMarkdown(url) {
    try {
        console.log(`🔄 Extracting HTML from: ${url}`);
        
        // 1. HTML Extraction
        const response = await axios.get(url, {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const html = response.data;
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });
        
        const rawMarkdown = turndownService.turndown(html);
        
        // 2. Processing with GPT-4o-mini
        console.log(`🤖 Organizing content with GPT-4o-mini...`);
        const cleanMarkdown = await chatGPT.organizeMarkdown(rawMarkdown, url);
        
        // 3. Save to organized directories
        const fileName = generateFileName(url);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // File paths
        const rawPath = path.join(DIRS.raw, `${fileName}.md`);
        const cleanPath = path.join(DIRS.clean, `${fileName}.md`);
        
        // Save files
        fs.writeFileSync(rawPath, rawMarkdown);
        fs.writeFileSync(cleanPath, cleanMarkdown);
        
        console.log(`✅ Raw markdown saved to: ${rawPath}`);
        console.log(`🎯 Clean markdown saved to: ${cleanPath}`);
        
        return { 
            clean: cleanMarkdown, 
            raw: rawMarkdown,
            paths: { raw: rawPath, clean: cleanPath },
            fileName
        };
        
    } catch (error) {
        console.error(`❌ Error processing ${url}:`, error.message);
        throw error;
    }
}

/**
 * Processes multiple URLs from linksExtractor.json
 */
async function processLinks() {
    // Create directory structure
    createDirectories();
    
    const linksPath = path.join(__dirname, 'linksExtractor.json');
    let links;
    
    try {
        links = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
    } catch (e) {
        console.error('❌ Error reading linksExtractor.json:', e.message);
        process.exit(1);
    }
    
    if (!Array.isArray(links) || links.length === 0) {
        console.error('❌ No links found in linksExtractor.json');
        process.exit(1);
    }
    
    console.log(`🚀 Processing ${links.length} links...`);
    console.log(`📁 Output structure:`);
    console.log(`   📄 RAW: ${DIRS.raw}`);
    console.log(`   ✨ CLEAN: ${DIRS.clean}`);
    console.log(`   📊 REPORTS: ${DIRS.reports}`);
    
    const report = {
        timestamp: new Date().toISOString(),
        total: links.length,
        successes: 0,
        errors: 0,
        directories: DIRS,
        details: []
    };
    
    for (const url of links) {
        try {
            const result = await extractToMarkdown(url);
            report.successes++;
            report.details.push({
                url,
                status: 'success',
                fileName: result.fileName,
                cleanSize: result.clean.length,
                rawSize: result.raw.length,
                compression: `${((1 - result.clean.length / result.raw.length) * 100).toFixed(1)}%`,
                paths: result.paths
            });
            
            // Rate limiting to avoid API overload
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            report.errors++;
            report.details.push({
                url,
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // Save report with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(DIRS.reports, `report_${timestamp}.json`);
    const reportLatestPath = path.join(DIRS.reports, 'report_latest.json');
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    fs.writeFileSync(reportLatestPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 FINAL REPORT:`);
    console.log(`✅ Successes: ${report.successes}`);
    console.log(`❌ Errors: ${report.errors}`);
    console.log(`📈 Success rate: ${((report.successes / report.total) * 100).toFixed(1)}%`);
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`🔄 Latest report: ${reportLatestPath}`);
    
    // Generate summary statistics
    if (report.successes > 0) {
        const successes = report.details.filter(d => d.status === 'success');
        const averageSize = successes.reduce((acc, curr) => acc + curr.cleanSize, 0) / successes.length;
        const averageCompression = successes.reduce((acc, curr) => acc + parseFloat(curr.compression), 0) / successes.length;
        
        console.log(`\n📈 STATISTICS:`);
        console.log(`📄 Average clean doc size: ${Math.round(averageSize)} chars`);
        console.log(`🗜️  Average compression: ${averageCompression.toFixed(1)}%`);
    }
}

// Execution
if (require.main === module) {
    processLinks();
}

module.exports = { extractToMarkdown, processLinks };