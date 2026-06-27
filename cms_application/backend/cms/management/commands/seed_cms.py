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
                'address': 'Zanzibar, Tanzania',
                'working_days': 'Monday - Saturday',
                'working_hours': '08:00 - 17:00',
                'footer_text': 'Welcome to G&S Contractors LTD. Building quality and delivering excellence across Zanzibar, Tanzania.',
            },
        )
        HeroSection.objects.get_or_create(
            title='G&S CONTRACTORS LTD',
            defaults={
                'subtitle': 'BUILDING QUALITY. DELIVERING EXCELLENCE.',
                'description': 'Trusted construction solutions across Zanzibar, Tanzania.',
            },
        )
        AboutSection.objects.get_or_create(
            title='Welcome To G&S Contractors LTD',
            defaults={
                'description': 'We are a trusted construction company committed to delivering exceptional building solutions across Zanzibar, Tanzania. We specialize in residential, commercial and infrastructure projects with a strong focus on quality, safety and client satisfaction.',
                'bullet_points': [
                    'High quality workmanship',
                    'On-time project delivery',
                    'Cost effective solutions',
                    'Safety and integrity always',
                    'Client satisfaction guaranteed',
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
        for i, title in enumerate(['Luxury Villas', 'Swimming Pools', 'African Style Buildings', 'Renovations', 'Site Management', 'Project Management']):
            Service.objects.get_or_create(
                slug=title.lower().replace(' ', '-'),
                defaults={
                    'title': title,
                    'short_description': f'Professional {title.lower()} services delivered with quality, safety and client satisfaction.',
                    'full_description': f'G&S Contractors LTD provides {title.lower()} services for residential, commercial and infrastructure projects across Zanzibar, Tanzania.',
                    'category': 'Construction',
                    'display_order': i,
                },
            )
        for i, (label, value) in enumerate([('Happy Clients', 183), ('Projects', 2363), ('Years of experience', 5)]):
            Statistic.objects.get_or_create(
                label=label,
                defaults={'value': value, 'suffix': '', 'display_order': i},
            )
        for i, (name, position, message) in enumerate([
            ('Said Ally Ahmed', 'Chief Executive Officer (CEO)', 'Leading G&S Contractors LTD with a focus on quality, reliability and client satisfaction.'),
            ('Giovanni Pullini', 'Managing Director', 'Driving project delivery with practical planning, strong management and attention to detail.'),
            ('Adam Abdalla Said (Natepe)', 'Manager SCCL.', 'We are going to make SCCL the best Construction Company throughout.'),
        ]):
            TeamMember.objects.get_or_create(
                name=name,
                defaults={'position': position, 'message': message, 'display_order': i},
            )
        self.stdout.write(self.style.SUCCESS('CMS starter content is ready.'))
