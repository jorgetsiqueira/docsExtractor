# DocsExtractor

A powerful Node.js tool for extracting web pages and converting them to clean, structured markdown documentation using GPT-4o-mini optimization.

## 🎯 Overview

DocsExtractor is designed to help developers and content creators extract HTML content from web pages and convert it into clean, organized markdown documentation. The tool uses GPT-4o-mini to intelligently clean and structure the extracted content, making it perfect for creating documentation, knowledge bases, or training data for LLMs.

## ✨ Features

- **🔗 Bulk URL Processing**: Process multiple URLs from a JSON configuration file
- **🤖 AI-Powered Cleaning**: Uses GPT-4o-mini to clean and structure markdown content
- **📁 Organized Output**: Automatically creates separate directories for raw and clean markdown files
- **📊 Detailed Reports**: Generates comprehensive reports with statistics and processing details
- **🗜️ Content Optimization**: Removes noise, navigation elements, and improves structure
- **⚡ Rate Limiting**: Built-in rate limiting to avoid API overload
- **🔄 Error Handling**: Robust error handling with detailed error reporting

## 🛠️ Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd docsExtractor
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 Usage

### Basic Usage

1. **Configure URLs**: Edit the `linksExtractor.json` file with your target URLs:
```json
[
  "https://example.com/page1",
  "https://example.com/page2",
  "https://example.com/page3"
]
```

2. **Run the extractor**:
```bash
npm start
```

### URL Extraction with Firecrawl

For easier URL extraction, you can use [Firecrawl](https://firecrawl.dev/) to get URLs from a website:

1. **Install Firecrawl CLI** (if not already installed):
```bash
npm install -g firecrawl
```

2. **Use Firecrawl's /map endpoint** to extract URLs:
```bash
# Example: Extract all URLs from a website
curl -X POST https://api.firecrawl.dev/v0/map \
  -H "Authorization: Bearer YOUR_FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "includeSubdomains": true,
    "limit": 100
  }' > firecrawl_urls.json
```

3. **Convert Firecrawl output to linksExtractor.json**:
```bash
# Extract URLs from Firecrawl JSON output
cat firecrawl_urls.json | jq -r '.links[].url' > urls.txt
# Convert to JSON array format
jq -R -s 'split("\n") | map(select(length > 0))' urls.txt > linksExtractor.json
```

## 📁 Output Structure

The tool creates the following directory structure:

```
output/
├── raw/           # Raw markdown files (direct HTML to markdown conversion)
├── clean/         # Clean markdown files (GPT-4o-mini optimized)
└── reports/       # Processing reports and statistics
    ├── report_latest.json
    └── report_YYYY-MM-DDTHH-MM-SS.json
```

## 📊 Report Structure

Each processing run generates a detailed report with:

```json
{
  "timestamp": "2025-07-05T14:44:24.939Z",
  "total": 1,
  "successes": 1,
  "errors": 0,
  "directories": {
    "raw": "/path/to/raw",
    "clean": "/path/to/clean",
    "reports": "/path/to/reports"
  },
  "details": [
    {
      "url": "https://example.com",
      "status": "success",
      "fileName": "example_com",
      "cleanSize": 3717,
      "rawSize": 35410,
      "compression": "89.5%",
      "paths": {
        "raw": "/path/to/raw/example_com.md",
        "clean": "/path/to/clean/example_com.md"
      }
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key for GPT-4o-mini access

### Input Configuration

- `linksExtractor.json`: Array of URLs to process

### Processing Parameters

The tool uses the following defaults:
- **Timeout**: 30 seconds per URL
- **Rate Limiting**: 1 second between requests
- **GPT Model**: gpt-4o-mini
- **Temperature**: 0.1 (for consistency)
- **Max Tokens**: 4000

## 🎨 GPT-4o-mini Optimization

The AI cleaning process:

1. **Removes**:
   - Navigation elements (menus, breadcrumbs, sidebars)
   - UI elements (buttons, forms, popups)
   - Advertising and promotional content
   - Repetitive headers and footers
   - Unnecessary metadata

2. **Improves**:
   - Hierarchical structure with proper heading levels
   - Code syntax highlighting
   - Table formatting
   - List organization
   - Link relevance

3. **Standardizes**:
   - Consistent spacing and formatting
   - Proper markdown syntax
   - Logical content organization

## 📚 API Reference

### Main Functions

#### `extractToMarkdown(url)`
Extracts and processes a single URL.

**Parameters:**
- `url` (string): The URL to process

**Returns:**
- Object with `clean`, `raw`, `paths`, and `fileName` properties

#### `processLinks()`
Processes all URLs from `linksExtractor.json`.

**Returns:**
- Void (generates files and reports)

## 🔍 Statistics

Typical compression rates:
- **Content Reduction**: 80-95%
- **Noise Removal**: 90%+
- **Structure Improvement**: Consistent hierarchical organization
- **Processing Speed**: ~2-3 seconds per page (including AI processing)

## 🐛 Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY not found"**
   - Ensure your `.env` file exists and contains the correct API key

2. **"No links found in linksExtractor.json"**
   - Check that the JSON file exists and contains a valid array of URLs

3. **Rate limiting errors**
   - The tool includes built-in rate limiting (1 second between requests)
   - For heavy usage, consider increasing the delay in the code

4. **Timeout errors**
   - Increase the timeout value in the axios configuration
   - Some sites may require longer loading times

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the generated reports for detailed error information

## 🔄 Changelog

### v1.0.0
- Initial release
- GPT-4o-mini integration
- Bulk URL processing
- Comprehensive reporting
- Error handling and rate limiting
