/**
 * Page Data Extractor — orchestrates all extraction modules
 */

import * as cheerio from 'cheerio';
import { extractMetadata } from './metadataExtractor.js';
import { extractHeadings } from './headingExtractor.js';
import { extractCleanText, detectAnswerFirst, estimateContentDepth } from './textExtractor.js';
import { extractInternalLinks, computeLinkMetrics } from './linkExtractor.js';
import {
    detectFAQ,
    detectTables,
    detectLists,
    detectComparison,
    detectDefinitions,
    detectHowTo,
} from './structureDetector.js';

/**
 * Extract all relevant data from a single page HTML
 */
export function extractPageData(html, pageUrl, baseDomain) {
    const $ = cheerio.load(html, {
        decodeEntities: true,
        normalizeWhitespace: false,
    });

    // Core extractions
    const metadata = extractMetadata($);
    const headings = extractHeadings($);
    const textData = extractCleanText($);
    const internalLinks = extractInternalLinks($, pageUrl, baseDomain);
    const linkMetrics = computeLinkMetrics(internalLinks);

    // Structure detections
    const faq = detectFAQ($);
    const tables = detectTables($);
    const lists = detectLists($);
    const comparison = detectComparison($);
    const definitions = detectDefinitions($);
    const howTo = detectHowTo($);

    // Computed signals
    const answerFirst = detectAnswerFirst($);
    const contentDepth = estimateContentDepth(textData.wordCount);

    return {
        url: pageUrl,
        canonical: metadata.canonical,

        // Metadata
        title: metadata.title,
        metaDescription: metadata.metaDescription,
        ogTitle: metadata.ogTitle,
        ogDescription: metadata.ogDescription,
        ogType: metadata.ogType,
        language: metadata.language,
        robots: metadata.robots,
        schemaTypes: metadata.schemaTypes,

        // Headings
        h1: headings.h1,
        h2s: headings.h2s,
        h3s: headings.h3s,
        totalHeadings: headings.totalHeadings,
        hasMultipleH1: headings.hasMultipleH1,
        headingHierarchy: headings.headingHierarchy,

        // Content
        extractedText: textData.text,
        wordCount: textData.wordCount,
        contentDepth,
        snippets: textData.snippets,

        // Links
        internalLinks,
        linkMetrics,

        // Structure
        hasFAQ: faq.hasFAQ,
        faqData: faq,
        hasTable: tables.hasTable,
        tableData: tables,
        hasList: lists.hasList,
        listData: lists,
        hasComparison: comparison.hasComparison,
        comparisonData: comparison,
        hasDefinitions: definitions.hasDefinitions,
        definitionData: definitions,
        hasHowTo: howTo.hasHowTo,
        howToData: howTo,

        // Signals
        hasAnswerFirst: answerFirst,
        hasShortAnswerNearTop: answerFirst && textData.snippets.length > 0,
    };
}
