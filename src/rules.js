// Required (error) and recommended (warning) properties for types that power Google rich results.
// "a|b" means at least one of them. Based on Google Search Central structured data guidelines.
export const RULES = {
  Article: { required: ['headline'], recommended: ['image', 'datePublished', 'author', 'dateModified'] },
  Product: { required: ['name', 'offers|review|aggregateRating'], recommended: ['image', 'description', 'brand', 'sku|gtin|gtin13|mpn'] },
  Offer: { required: ['price|priceSpecification'], recommended: ['priceCurrency', 'availability', 'url'] },
  AggregateOffer: { required: ['lowPrice', 'priceCurrency'], recommended: ['highPrice', 'offerCount'] },
  AggregateRating: { required: ['ratingValue', 'ratingCount|reviewCount'], recommended: [] },
  Review: { required: ['author', 'reviewRating|reviewBody'], recommended: ['itemReviewed', 'datePublished'] },
  Rating: { required: ['ratingValue'], recommended: ['bestRating'] },
  BreadcrumbList: { required: ['itemListElement'], recommended: [] },
  ListItem: { required: ['position'], recommended: ['name', 'item'] },
  FAQPage: { required: ['mainEntity'], recommended: [] },
  Question: { required: ['name', 'acceptedAnswer'], recommended: [] },
  Answer: { required: ['text'], recommended: [] },
  Organization: { required: ['name'], recommended: ['url', 'logo', 'sameAs'] },
  LocalBusiness: { required: ['name', 'address'], recommended: ['telephone', 'openingHoursSpecification|openingHours', 'geo', 'url', 'image'] },
  PostalAddress: { required: [], recommended: ['streetAddress', 'addressLocality', 'postalCode', 'addressCountry'] },
  Person: { required: ['name'], recommended: ['url'] },
  Event: { required: ['name', 'startDate', 'location'], recommended: ['endDate', 'eventStatus', 'image', 'description', 'offers', 'organizer'] },
  Recipe: { required: ['name', 'image'], recommended: ['recipeIngredient', 'recipeInstructions', 'author', 'totalTime', 'nutrition', 'aggregateRating'] },
  HowTo: { required: ['name', 'step'], recommended: ['image', 'totalTime'] },
  VideoObject: { required: ['name', 'thumbnailUrl', 'uploadDate'], recommended: ['description', 'duration', 'contentUrl|embedUrl'] },
  JobPosting: { required: ['title', 'description', 'datePosted', 'hiringOrganization', 'jobLocation|jobLocationType'], recommended: ['validThrough', 'employmentType', 'baseSalary'] },
  WebSite: { required: ['name|url'], recommended: ['potentialAction'] },
  SoftwareApplication: { required: ['name', 'offers|aggregateRating|review'], recommended: ['applicationCategory', 'operatingSystem'] },
  Course: { required: ['name', 'description', 'provider'], recommended: [] },
  ImageObject: { required: ['contentUrl|url'], recommended: [] },
};

/** Subtypes that share their parent's rules. */
export const ALIASES = {
  NewsArticle: 'Article', BlogPosting: 'Article', TechArticle: 'Article', Report: 'Article',
  Restaurant: 'LocalBusiness', Store: 'LocalBusiness', Dentist: 'LocalBusiness', MedicalBusiness: 'LocalBusiness', Hotel: 'LocalBusiness', AutoRepair: 'LocalBusiness', LegalService: 'LocalBusiness', ProfessionalService: 'LocalBusiness',
  Corporation: 'Organization', NGO: 'Organization', EducationalOrganization: 'Organization', OnlineStore: 'Organization',
  MobileApplication: 'SoftwareApplication', WebApplication: 'SoftwareApplication', VideoGame: 'SoftwareApplication',
  ProductGroup: 'Product', IndividualProduct: 'Product',
};

export const DATE_PROPS = new Set(['datePublished', 'dateModified', 'uploadDate', 'startDate', 'endDate', 'datePosted', 'validThrough', 'priceValidUntil', 'dateCreated']);
export const URL_PROPS = new Set(['url', 'image', 'logo', 'thumbnailUrl', 'contentUrl', 'embedUrl', 'sameAs', 'item']);
