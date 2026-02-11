import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "welcome": "Bienvenue chez Travel Lounge Maurice",
            "search_placeholder": "Recherchez des hôtels, vols, excursions...",
            "booking_request": "Demande de Réservation",
            "consent_text": "J'accepte le traitement de mes données selon la Politique de Confidentialité",
            "categories": {
                "hotels": "Hotels",
                "flights": "Flights",
                "tours": "Tours",
                "transfers": "Transfers",
                "sea_activities": "Sea Activities",
                "land_activities": "Land Activities",
                "day_packages": "Day Packages",
                "spa": "Spa & Wellness"
            },
            "about": {
                "title": "About Us",
                "subtitle": "Crafting unforgettable Mauritian journeys since 2010.",
                "story_title": "Our Story",
                "story_text": "Travel Lounge was born from a passion for the paradise island of Mauritius. We realized that while many visit, few truly *experience* the authentic luxury and warmth of our island home.",
                "story_subtext": "We are not just a booking platform; we are your local concierge, ensuring every moment of your stay is curated with precision, safety, and a touch of island magic."
            },
            "newsletter": {
                "join": "Join the Lounge",
                "title": "Get secret Mauritius deals.",
                "placeholder": "your@email.com",
                "consent": "I agree to receive communications as per the Privacy Policy. No spam, only paradise.",
                "success": "You're on the list!",
                "success_sub": "Expect the best island deals in your inbox soon."
            },
            "contact": {
                "title": "Contact Us",
                "subtitle": "We'd love to hear from you. Get in touch with our team.",
                "form": {
                    "name": "My Name is",
                    "email": "My Email is",
                    "message": "My Message",
                    "send": "Send Message"
                }
            },
            "footer": {
                "locations": "Locations",
                "hours": "Working Hours",
                "contact": "Contact",
                "rights": "All rights reserved."
            }
        }
    },
    fr: {
        translation: {
            "welcome": "Bienvenue chez Travel Lounge Maurice",
            "search_placeholder": "Recherchez des hôtels, vols, excursions...",
            "booking_request": "Demande de Réservation",
            "consent_text": "J'accepte le traitement de mes données selon la Politique de Confidentialité",
            "categories": {
                "hotels": "Hôtels",
                "flights": "Vols",
                "tours": "Circuits",
                "transfers": "Transferts",
                "sea_activities": "Activités Nautiques",
                "land_activities": "Activités Terrestres",
                "day_packages": "Forfaits Journée",
                "spa": "Spa & Bien-être"
            },
            "about": {
                "title": "À Propos",
                "subtitle": "Créateurs de voyages inoubliables à Maurice depuis 2010.",
                "story_title": "Notre Histoire",
                "story_text": "Travel Lounge est né d'une passion pour l'île paradisiaque de Maurice. Nous avons réalisé que si beaucoup visitent, peu font vraiment l'expérience du luxe authentique et de la chaleur de notre île.",
                "story_subtext": "Nous ne sommes pas seulement une plateforme de réservation ; nous sommes votre concierge local, veillant à ce que chaque moment de votre séjour soit organisé avec précision, sécurité et une touche de magie insulaire."
            },
            "newsletter": {
                "join": "Rejoignez le Lounge",
                "title": "Recevez nos offres secrètes.",
                "placeholder": "votre@email.com",
                "consent": "J'accepte de recevoir des communications conformément à la Politique de Confidentialité. Pas de spam, juste le paradis.",
                "success": "Vous êtes inscrit !",
                "success_sub": "Attendez-vous bientôt aux meilleures offres de l'île dans votre boîte de réception."
            },
            "contact": {
                "title": "Contactez-nous",
                "subtitle": "Nous aimerions avoir de vos nouvelles. Contactez notre équipe.",
                "form": {
                    "name": "Mon Nom est",
                    "email": "Mon Email est",
                    "message": "Mon Message",
                    "send": "Envoyer le Message"
                }
            },
            "footer": {
                "locations": "Nos Adresses",
                "hours": "Horaires d'ouverture",
                "contact": "Contact",
                "rights": "Tous droits réservés."
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
