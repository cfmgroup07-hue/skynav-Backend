import VisaCountry from '../models/VisaCountry.js';
import VisaRule from '../models/VisaRule.js';

const seedVisaData = async () => {
    const count = await VisaCountry.countDocuments();
    if (count > 0) return;

    const countries = await VisaCountry.insertMany([
        {
            name: 'United Arab Emirates',
            slug: 'united-arab-emirates',
            code: 'AE',
            region: 'Middle East',
            imageUrl: '/images/Dubai.jpg',
        },
        {
            name: 'Thailand',
            slug: 'thailand',
            code: 'TH',
            region: 'Asia',
            imageUrl: '/images/Bangkok.jpg',
        },
        {
            name: 'United Kingdom',
            slug: 'united-kingdom',
            code: 'GB',
            region: 'Europe',
            imageUrl: '/images/London.jpg',
        },
    ]);

    const rules = countries.flatMap((country) => [
        {
            country: country._id,
            type: 'tourist',
            title: `${country.name} Tourist Visa`,
            description: 'Standard tourist visa with quick processing.',
            requirements: ['Valid passport', 'Travel itinerary', 'Bank statement'],
            documents: ['Passport copy', 'Photo', 'Hotel booking'],
            processingTime: '5-7 working days',
            validity: '30 days',
            entryType: 'Single entry',
            maxStay: '30 days',
            pricing: { amount: 120, currency: 'USD' },
            whyUs: ['Document verification', 'Fast processing', '24/7 support'],
            faqs: [{ question: 'Is it refundable?', answer: 'Refundable if not approved.' }],
        },
        {
            country: country._id,
            type: 'business',
            title: `${country.name} Business Visa`,
            description: 'Business visa for meetings and conferences.',
            requirements: ['Invitation letter', 'Company ID', 'Valid passport'],
            documents: ['Invitation letter', 'Passport copy', 'Photo'],
            processingTime: '7-10 working days',
            validity: '60 days',
            entryType: 'Multiple entry',
            maxStay: '45 days',
            pricing: { amount: 180, currency: 'USD' },
            whyUs: ['Business compliance review', 'Fast-track processing', 'Dedicated support'],
            faqs: [{ question: 'Is multiple entry allowed?', answer: 'Yes, for the validity period.' }],
        },
    ]);

    await VisaRule.insertMany(rules);
    console.log('✅ Visa seed data created');
};

export default seedVisaData;
