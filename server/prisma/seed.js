"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var slugify_1 = require("slugify");
var prisma = new client_1.PrismaClient();
var SALT_ROUNDS = 12;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var hashedPassword, rahim, fatema, karim, nusrat, sabbir, now, campaignData, campaigns, _i, campaignData_1, data, slug, campaign, donationData, _a, donationData_1, data, existing, _b, campaigns_1, campaign, result;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('🌱 Seeding started...\n');

                    console.log('Seeding users...');
                    return [4 , bcryptjs_1.default.hash('Password123!', SALT_ROUNDS)];
                case 1:
                    hashedPassword = _d.sent();
                    return [4 , prisma.user.upsert({
                            where: { email: 'rahim@example.com' },
                            update: {},
                            create: {
                                name: 'Rahim Uddin Ahmed',
                                email: 'rahim@example.com',
                                password: hashedPassword,
                                role: client_1.Role.ADMIN,
                                isVerified: true,
                            },
                        })];
                case 2:
                    rahim = _d.sent();
                    return [4 , prisma.user.upsert({
                            where: { email: 'fatema@example.com' },
                            update: {},
                            create: {
                                name: 'Fatema Begum',
                                email: 'fatema@example.com',
                                password: hashedPassword,
                                role: client_1.Role.CREATOR,
                                isVerified: true,
                            },
                        })];
                case 3:
                    fatema = _d.sent();
                    return [4 , prisma.user.upsert({
                            where: { email: 'karim@example.com' },
                            update: {},
                            create: {
                                name: 'Karim Hossain',
                                email: 'karim@example.com',
                                password: hashedPassword,
                                role: client_1.Role.CREATOR,
                                isVerified: true,
                            },
                        })];
                case 4:
                    karim = _d.sent();
                    return [4 , prisma.user.upsert({
                            where: { email: 'nusrat@example.com' },
                            update: {},
                            create: {
                                name: 'Nusrat Jahan',
                                email: 'nusrat@example.com',
                                password: hashedPassword,
                                role: client_1.Role.DONOR,
                                isVerified: true,
                            },
                        })];
                case 5:
                    nusrat = _d.sent();
                    return [4 , prisma.user.upsert({
                            where: { email: 'sabbir@example.com' },
                            update: {},
                            create: {
                                name: 'Sabbir Rahman',
                                email: 'sabbir@example.com',
                                password: hashedPassword,
                                role: client_1.Role.DONOR,
                                isVerified: false,
                            },
                        })];
                case 6:
                    sabbir = _d.sent();
                    console.log('✓ Users seeded (5)\n');

                    console.log('Seeding campaigns...');
                    now = new Date();
                    campaignData = [
                        {
                            title: 'Flood Relief for Sylhet',
                            description: 'Emergency flood relief for thousands of displaced families in Sylhet division.',
                            story: "The devastating floods in Sylhet have left thousands of families homeless and without food. \nRivers have overflowed their banks, submerging entire villages under water. Children, elderly, and \npregnant women are among the most vulnerable. Your donation will provide emergency food kits, \nclean drinking water, temporary shelter, and medicine to affected families. Every taka counts \nin this critical time of need.",
                            goalAmount: 500000,
                            category: 'Disaster Relief',
                            status: client_1.CampaignStatus.ACTIVE,
                            beneficiaryName: 'Sylhet Flood Victims',
                            beneficiaryInfo: 'Approximately 5,000 families across 12 unions in Sylhet division',
                            deadline: new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
                            creatorId: fatema.id,
                            images: [],
                        },
                        {
                            title: 'Build a School in Char Fasson',
                            description: 'Help us build a primary school for 300+ children in the remote char of Bhola.',
                            story: "Children in Char Fasson walk 10 kilometers daily just to reach the nearest school \u2014 \nif they go at all. Many drop out before completing primary education due to distance, poverty, \nand lack of infrastructure. We are building a 6-room primary school with proper sanitation, \nelectricity, and a library. This school will serve over 300 children from 5 surrounding villages \nand transform the future of an entire community.",
                            goalAmount: 800000,
                            category: 'Education',
                            status: client_1.CampaignStatus.ACTIVE,
                            beneficiaryName: 'Children of Char Fasson',
                            beneficiaryInfo: '300+ children aged 5-12 from 5 villages in Char Fasson, Bhola',
                            deadline: new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()),
                            creatorId: karim.id,
                            images: [],
                        },
                        {
                            title: 'Cancer Treatment for Roksana',
                            description: 'Roksana Akter, a 34-year-old mother of two, needs urgent cancer treatment.',
                            story: "Roksana Akter was diagnosed with stage 3 breast cancer three months ago. A garment \nworker from Mirpur, she is the sole earner for her two young children aged 6 and 9. The total \ntreatment cost including surgery, chemotherapy, and follow-up care is approximately 4.5 lakh taka. \nHer family has already sold everything they own. With your support, Roksana can fight this \nbattle and return to her children. Every donation directly funds her medical bills at DMCH.",
                            goalAmount: 450000,
                            category: 'Medical',
                            status: client_1.CampaignStatus.ACTIVE,
                            beneficiaryName: 'Roksana Akter',
                            beneficiaryInfo: '34-year-old garment worker, mother of two, Mirpur, Dhaka',
                            deadline: new Date(now.getFullYear(), now.getMonth() + 4, now.getDate()),
                            creatorId: fatema.id,
                            images: [],
                        },
                        {
                            title: 'Plant Trees in Sundarbans',
                            description: 'Restore mangrove forests in the Sundarbans to protect Bangladesh\'s coastline.',
                            story: "The Sundarbans mangrove forest \u2014 the world's largest \u2014 is shrinking at an alarming rate \ndue to climate change, illegal logging, and rising sea levels. We successfully planted 50,000 \nmangrove saplings across 200 acres of degraded coastal land. This campaign has been completed \nthanks to the generosity of donors like you. The saplings are now growing strong and will protect \ncoastal communities from cyclones and tidal surges for generations to come. Thank you Bangladesh!",
                            goalAmount: 200000,
                            raisedAmount: 213500,
                            donorCount: 87,
                            category: 'Environment',
                            status: client_1.CampaignStatus.COMPLETED,
                            beneficiaryName: 'Coastal Communities of Khulna',
                            beneficiaryInfo: 'Approximately 15 villages across the Sundarbans buffer zone',
                            deadline: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
                            creatorId: karim.id,
                            images: [],
                        },
                        {
                            title: 'Street Dogs Rescue Dhaka',
                            description: 'Rescue, treat, and rehome injured and sick street dogs across Dhaka city.',
                            story: "Over 100,000 stray dogs roam the streets of Dhaka, many suffering from mange, \ndistemper, injuries from traffic accidents, and abuse. Our small team of veterinarians and \nvolunteers rescues the most critical cases, provides medical treatment, and finds loving homes \nfor those who recover. Your donation funds medicine, surgical equipment, food, and temporary \nshelter for rescued animals. Together we can make Dhaka more humane for all its inhabitants.",
                            goalAmount: 150000,
                            category: 'Animal Welfare',
                            status: client_1.CampaignStatus.ACTIVE,
                            beneficiaryName: 'Stray Dogs of Dhaka',
                            beneficiaryInfo: 'Street dogs across Mirpur, Mohammadpur, Uttara, and Old Dhaka',
                            deadline: new Date(now.getFullYear(), now.getMonth() + 5, now.getDate()),
                            creatorId: fatema.id,
                            images: [],
                        },
                    ];
                    campaigns = [];
                    _i = 0, campaignData_1 = campaignData;
                    _d.label = 7;
                case 7:
                    if (!(_i < campaignData_1.length)) return [3 , 10];
                    data = campaignData_1[_i];
                    slug = (0, slugify_1.default)(data.title, { lower: true, strict: true });
                    return [4 , prisma.campaign.upsert({
                            where: { slug: slug },
                            update: {},
                            create: __assign(__assign({}, data), { slug: slug }),
                        })];
                case 8:
                    campaign = _d.sent();
                    campaigns.push(campaign);
                    _d.label = 9;
                case 9:
                    _i++;
                    return [3 , 7];
                case 10:
                    console.log('✓ Campaigns seeded (5)\n');

                    console.log('Seeding donations...');
                    donationData = [
                        { amount: 5000, donorId: nusrat.id, campaignId: campaigns[0].id, message: 'Stay strong Sylhet!' },
                        { amount: 2500, donorId: sabbir.id, campaignId: campaigns[0].id, message: 'Prayers for the victims.' },
                        { amount: 10000, donorId: nusrat.id, campaignId: campaigns[1].id, message: 'Education is the future.' },
                        { amount: 3000, donorId: sabbir.id, campaignId: campaigns[1].id, message: 'Every child deserves a school.' },
                        { amount: 7500, donorId: nusrat.id, campaignId: campaigns[2].id, message: 'Get well soon Roksana Apa.' },
                        { amount: 1500, donorId: sabbir.id, campaignId: campaigns[2].id, message: 'Wishing you a full recovery.' },
                        { amount: 500, donorId: nusrat.id, campaignId: campaigns[3].id, message: 'Green Bangladesh forever.' },
                        { amount: 8000, donorId: sabbir.id, campaignId: campaigns[3].id, message: 'Save our Sundarbans!' },
                        { amount: 2000, donorId: nusrat.id, campaignId: campaigns[4].id, message: 'Be kind to animals.' },
                        { amount: 4500, donorId: sabbir.id, campaignId: campaigns[4].id, message: 'Love these rescue efforts.' },
                    ];
                    _a = 0, donationData_1 = donationData;
                    _d.label = 11;
                case 11:
                    if (!(_a < donationData_1.length)) return [3 , 15];
                    data = donationData_1[_a];
                    return [4 , prisma.donation.findFirst({
                            where: {
                                donorId: data.donorId,
                                campaignId: data.campaignId,
                                amount: data.amount,
                            },
                        })];
                case 12:
                    existing = _d.sent();
                    if (!!existing) return [3 , 14];
                    return [4 , prisma.donation.create({
                            data: __assign(__assign({}, data), { status: client_1.DonationStatus.COMPLETED }),
                        })];
                case 13:
                    _d.sent();
                    _d.label = 14;
                case 14:
                    _a++;
                    return [3 , 11];
                case 15:
                    _b = 0, campaigns_1 = campaigns;
                    _d.label = 16;
                case 16:
                    if (!(_b < campaigns_1.length)) return [3 , 20];
                    campaign = campaigns_1[_b];
                    if (campaign.status === client_1.CampaignStatus.COMPLETED)
                        return [3 , 19];
                    return [4 , prisma.donation.aggregate({
                            where: { campaignId: campaign.id, status: client_1.DonationStatus.COMPLETED },
                            _sum: { amount: true },
                            _count: { id: true },
                        })];
                case 17:
                    result = _d.sent();
                    return [4 , prisma.campaign.update({
                            where: { id: campaign.id },
                            data: {
                                raisedAmount: (_c = result._sum.amount) !== null && _c !== void 0 ? _c : 0,
                                donorCount: result._count.id,
                            },
                        })];
                case 18:
                    _d.sent();
                    _d.label = 19;
                case 19:
                    _b++;
                    return [3 , 16];
                case 20:
                    console.log('✓ Donations seeded (10)\n');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('🎉 Seeding complete ✓');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log("   Users:     5");
                    console.log("   Campaigns: 5");
                    console.log("   Donations: 10");
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    return [2 ];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 , prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 ];
        }
    });
}); });
