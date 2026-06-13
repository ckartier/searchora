// Builds the Schema.org JSON-LD graph from the sanitized audit.

function organization(audit) {
    const { company } = audit;
    const org = {
        '@type': 'Organization',
        '@id': `${company.url}#organization`,
        name: company.name,
        url: company.url,
    };
    if (company.legalName) org.legalName = company.legalName;
    if (company.logo) org.logo = company.logo;
    if (company.description) org.description = company.description;
    if (company.email) org.email = company.email;
    if (company.phone) org.telephone = company.phone;
    if (company.social.length) org.sameAs = company.social;
    if (company.founder) {
        org.founder = { '@id': `${company.url}#founder` };
    }
    return org;
}

function website(audit) {
    const { company } = audit;
    const site = {
        '@type': 'WebSite',
        '@id': `${company.url}#website`,
        url: company.url,
        name: company.name,
        publisher: { '@id': `${company.url}#organization` },
    };
    if (company.languages.length) site.inLanguage = company.languages;
    return site;
}

function faqPage(audit) {
    if (!audit.faq.length) return null;
    return {
        '@type': 'FAQPage',
        '@id': `${audit.company.url}#faq`,
        mainEntity: audit.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    };
}

function services(audit) {
    return audit.services.map((service, index) => {
        const node = {
            '@type': 'Service',
            '@id': `${audit.company.url}#service-${index + 1}`,
            name: service.name,
            provider: { '@id': `${audit.company.url}#organization` },
        };
        if (service.description) node.description = service.description;
        if (audit.company.industry) node.serviceType = audit.company.industry;
        return node;
    });
}

function founder(audit) {
    const person = audit.company.founder;
    if (!person) return null;
    const node = {
        '@type': 'Person',
        '@id': `${audit.company.url}#founder`,
        name: person.name,
        worksFor: { '@id': `${audit.company.url}#organization` },
    };
    if (person.title) node.jobTitle = person.title;
    return node;
}

function localBusiness(audit) {
    const { company } = audit;
    if (!company.address) return null;
    const node = {
        '@type': 'LocalBusiness',
        '@id': `${company.url}#localbusiness`,
        name: company.name,
        url: company.url,
        address: {
            '@type': 'PostalAddress',
            streetAddress: company.address.street,
            addressLocality: company.address.city,
            postalCode: company.address.zip,
            addressCountry: company.address.country,
        },
    };
    if (company.phone) node.telephone = company.phone;
    if (company.logo) node.image = company.logo;
    return node;
}

export function generateSchema(audit) {
    const graph = [
        organization(audit),
        website(audit),
        faqPage(audit),
        ...services(audit),
        founder(audit),
        localBusiness(audit),
    ].filter(Boolean);

    return {
        '@context': 'https://schema.org',
        '@graph': graph,
    };
}

// Serialized for embedding inside a <script> tag: "</" must be escaped so the
// payload can never close the script element early.
export function schemaToScriptJson(schema) {
    return JSON.stringify(schema, null, 2).replace(/<\//g, '<\\/');
}
