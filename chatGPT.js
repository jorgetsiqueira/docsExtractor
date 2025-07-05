const axios = require('axios');

/**
 * ChatGPT Service for markdown content optimization
 * Uses GPT-4o-mini to clean and structure markdown content
 */

class ChatGPTService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
    }

    /**
     * Organizes and cleans markdown content using GPT-4o-mini
     * @param {string} markdownContent - Raw markdown content
     * @param {string} url - Source URL for context
     * @returns {string} - Clean, structured markdown
     */
    async organizeMarkdown(markdownContent, url) {
        const prompt = `# TASK: Optimize Markdown for LLM Consumption

## CONTEXT
- Source: ${url}
- Objective: Transform raw markdown into structured, clean content
- Target audience: Other LLMs and processing systems

## SPECIFIC INSTRUCTIONS

### 1. COMPLETELY REMOVE
- Navigation elements (menu, breadcrumbs, sidebar)
- UI elements (buttons, forms, popups)
- Repetitive headers and footers
- Advertising and promotional content
- Duplicate or redundant code
- Unnecessary metadata (cookies, analytics)

### 2. STRUCTURE HIERARCHICALLY
- Use # for main title (maximum 1 per document)
- Use ## for main sections
- Use ### for subsections
- Use #### for specific details
- Maintain consistent numbering

### 3. PRESERVE AND IMPROVE
- Code: Keep with correct syntax highlighting
- Tables: Well-structured format
- Lists: Numbered or bulleted consistently
- Links: Only those relevant to content
- Images: With descriptive alt text

### 4. STANDARDIZE FORMAT
- Spacing: 1 line between paragraphs, 2 between sections
- Inline code: \`code\`
- Code blocks: \`\`\`language\`\`\`
- Emphasis: **bold** for important terms
- Italic: *italic* for concepts or definitions

### 5. OPTIMIZE FOR LLMs
- Add context when necessary
- Use clear, objective language
- Maintain factual information
- Avoid redundancy
- Organize logically: introduction → development → conclusion

## EXPECTED OUTPUT FORMAT
\`\`\`
# [Main Title]

## [Main Section]

Introductory paragraph with relevant context.

### [Subsection]

Detailed content with:
- Important points
- Practical examples
- Code when applicable

## [Next Section]

[Continue structure...]
\`\`\`

## ORIGINAL MARKDOWN
${markdownContent}

## FINAL INSTRUCTION
Return ONLY the clean and structured markdown, without additional comments or explanations.`;

        try {
            const response = await axios.post(this.baseURL, {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a content processing expert for AI systems. Your function is to transform raw markdown into structured, clean content optimized for consumption by other LLMs.

CRITICAL RULES:
1. Return ONLY clean markdown
2. Maintain consistent hierarchical structure
3. Preserve important technical information
4. Remove noise and irrelevant elements
5. Use standard markdown formatting

EXPECTED QUALITY:
- Clarity: 95%+
- Structure: Perfect hierarchy
- Cleanliness: Zero noise
- Utility: Maximum for LLMs`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.1, // Reduced for more consistency
                top_p: 0.9,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.data.choices[0].message.content;
        } catch (error) {
            console.error('Error processing with GPT:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Validates the quality of generated markdown
     * @param {string} markdown - The markdown content to validate
     * @returns {Object} - Quality metrics
     */
    validateMarkdownQuality(markdown) {
        const metrics = {
            hasMainTitle: markdown.includes('# '),
            hasStructure: markdown.includes('## '),
            hasFormatting: markdown.includes('**') || markdown.includes('*'),
            hasCode: markdown.includes('```'),
            size: markdown.length,
            lines: markdown.split('\n').length,
            density: markdown.split(' ').length / markdown.split('\n').length
        };

        return metrics;
    }
}

module.exports = ChatGPTService;