from django.core.management.base import BaseCommand
from cms.models import AboutSection, HeroSection, InfoCard, Service, SiteSetting, Statistic, TeamMember


class Command(BaseCommand):
    help = 'Seed the CMS with starter G&S Contractors LTD content.'

    def handle(self, *args, **kwargs):
        SiteSetting.objects.update_or_create(
            pk=1,
            defaults={
                'company_name': 'G&S Contractors LTD',
                'primary_phone': '+255 745 113 963',
                'secondary_phone': '+255 776 187 485',
                'email': 'info@gscontractorsltd.com',
                'location': 'Zanzibar, Tanzania',
                'location_sw': 'Zanzibar, Tanzania',
                'address': 'Zanzibar, Tanzania',
                'address_sw': 'Zanzibar, Tanzania',
                'working_days': 'Monday - Saturday',
                'working_days_sw': 'Jumatatu - Jumamosi',
                'working_hours': '08:00 - 17:00',
                'working_hours_sw': '08:00 - 17:00',
                'footer_text': 'Welcome to G&S Contractors LTD. Building quality and delivering excellence across Zanzibar, Tanzania.',
                'footer_text_sw': 'Karibu G&S Contractors LTD. Tunajenga kwa ubora na kutoa matokeo bora Zanzibar, Tanzania.',
            },
        )
        HeroSection.objects.get_or_create(
            title='G&S CONTRACTORS LTD',
            defaults={
                'title_sw': 'G&S CONTRACTORS LTD',
                'subtitle': 'BUILDING QUALITY. DELIVERING EXCELLENCE.',
                'subtitle_sw': 'TUNAJENGA KWA UBORA. TUNATOA MATOKEO BORA.',
                'description': 'Trusted construction services across Zanzibar and Tanzania.',
                'description_sw': 'Huduma za ujenzi zinazoaminika Zanzibar na Tanzania.',
            },
        )
        AboutSection.objects.get_or_create(
            title='Welcome To G&S Contractors LTD',
            defaults={
                'title_sw': 'Karibu G&S Contractors LTD',
                'description': 'We are a trusted construction company committed to delivering exceptional building solutions across Zanzibar, Tanzania. We specialize in residential, commercial and infrastructure projects with a strong focus on quality, safety and client satisfaction.',
                'description_sw': 'Sisi ni kampuni ya ujenzi inayoaminika inayotoa suluhisho bora za majengo Zanzibar, Tanzania.',
                'bullet_points': [
                    {
                        'title': 'High quality workmanship',
                        'description': 'We use quality materials, skilled teams and careful supervision.',
                    },
                    {
                        'title': 'On-time project delivery',
                        'description': 'We plan clearly and monitor progress so projects move on schedule.',
                    },
                    {
                        'title': 'Cost effective solutions',
                        'description': 'We balance strong construction standards with practical budgets.',
                    },
                    {
                        'title': 'Safety and integrity always',
                        'description': 'We protect people, property and client trust on every project.',
                    },
                    {
                        'title': 'Client satisfaction guaranteed',
                        'description': 'We communicate clearly and focus on results clients can trust.',
                    },
                ],
                'bullet_points_sw': [
                    {
                        'title': 'Kazi yenye ubora wa juu',
                        'description': 'Tunatumia vifaa bora, mafundi wenye ujuzi na usimamizi makini.',
                    },
                    {
                        'title': 'Kukamilisha miradi kwa wakati',
                        'description': 'Tunapanga vizuri na kufuatilia maendeleo ya kazi kila hatua.',
                    },
                    {
                        'title': 'Suluhisho zenye gharama nafuu',
                        'description': 'Tunazingatia ubora wa ujenzi pamoja na bajeti halisi ya mteja.',
                    },
                    {
                        'title': 'Usalama na uadilifu kila wakati',
                        'description': 'Tunalinda watu, mali na uaminifu wa mteja katika kila mradi.',
                    },
                    {
                        'title': 'Kuridhika kwa mteja ni kipaumbele',
                        'description': 'Tunawasiliana kwa uwazi na kuzingatia matokeo bora kwa mteja.',
                    },
                ],
            },
        )
        for i, (card_type, title, description) in enumerate([
            ('value', 'Quality', 'We use the finest materials and techniques to deliver superior construction quality.'),
            ('value', 'Reliability', 'We deliver projects on time, on budget and beyond expectations.'),
            ('value', 'Innovation', 'We embrace modern methods and innovative solutions to build a better future.'),
        ]):
            InfoCard.objects.get_or_create(
                type=card_type,
                title=title,
                defaults={'description': description, 'display_order': i},
            )
        services = [
            ('Luxury Villas', 'Majumba ya Kifahari'),
            ('Swimming Pools', 'Mabwawa ya Kuogelea'),
            ('African Style Buildings', 'Majengo ya Mtindo wa Kiafrika'),
            ('Renovations', 'Ukarabati'),
            ('Site Management', 'Usimamizi wa Eneo la Ujenzi'),
            ('Project Management', 'Usimamizi wa Mradi'),
        ]
        for i, (title, title_sw) in enumerate(services):
            Service.objects.get_or_create(
                slug=title.lower().replace(' ', '-'),
                defaults={
                    'title': title,
                    'title_sw': title_sw,
                    'short_description': f'Professional {title.lower()} services delivered with quality, safety and client satisfaction.',
                    'short_description_sw': f'Huduma za {title_sw.lower()} zinazotolewa kwa ubora, usalama na kuridhisha mteja.',
                    'full_description': f'G&S Contractors LTD provides {title.lower()} services for residential, commercial and infrastructure projects across Zanzibar, Tanzania.',
                    'full_description_sw': f'G&S Contractors LTD inatoa huduma za {title_sw.lower()} kwa miradi ya makazi, biashara na miundombinu Zanzibar, Tanzania.',
                    'category': 'Construction',
                    'category_sw': 'Ujenzi',
                    'display_order': i,
                },
            )
        for i, (label, label_sw, value) in enumerate([('Happy Clients', 'Wateja Wenye Furaha', 183), ('Projects', 'Miradi', 2363), ('Years of experience', 'Miaka ya Uzoefu', 5)]):
            Statistic.objects.get_or_create(
                label=label,
                defaults={'label_sw': label_sw, 'value': value, 'suffix': '', 'display_order': i},
            )
        for i, (name, position, message) in enumerate([
            ('Said Ally Ahmed', 'Chief Executive Officer (CEO)', 'Leading G&S Contractors LTD with a focus on quality, reliability and client satisfaction.'),
            ('Giovanni Pullini', 'Managing Director', 'Driving project delivery with practical planning, strong management and attention to detail.'),
            ('Adam Abdalla Said (Natepe)', 'Manager SCCL.', 'We are going to make SCCL the best Construction Company throughout.'),
        ]):
            TeamMember.objects.get_or_create(
                name=name,
                defaults={'position': position, 'position_sw': position, 'message': message, 'message_sw': message, 'display_order': i},
            )
        self.stdout.write(self.style.SUCCESS('CMS starter content is ready.'))
