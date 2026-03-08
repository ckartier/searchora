import { NextResponse } from 'next/server';
import { generateClusters } from '@/lib/clusterGenerator/index.js';

/**
 * POST /api/generate-clusters
 * Generate strategic content clusters for AI visibility
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            domain,
            companyName = '',
            industry = '',
            themes = [],
            trackedPrompts = [],
            contentGaps = [],
            faqOpportunities = [],
            comparisonOpportunities = [],
            definitionOpportunities = [],
            competitorMentions = [],
            auditData = null,
        } = body;

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
        }

        if (themes.length === 0 && trackedPrompts.length === 0 && !industry) {
            return NextResponse.json(
                { error: 'Please provide at least one theme, tracked prompt, or industry' },
                { status: 400 }
            );
        }

        const result = await generateClusters({
            domain,
            companyName,
            industry,
            themes: themes.filter(Boolean),
            trackedPrompts: trackedPrompts.filter(Boolean),
            contentGaps: contentGaps.filter(Boolean),
            faqOpportunities: faqOpportunities.filter(Boolean),
            comparisonOpportunities: comparisonOpportunities.filter(Boolean),
            definitionOpportunities: definitionOpportunities.filter(Boolean),
            competitorMentions: competitorMentions.filter(Boolean),
            auditData,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Cluster generation API error:', error);
        return NextResponse.json(
            { error: 'Cluster generation failed: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
