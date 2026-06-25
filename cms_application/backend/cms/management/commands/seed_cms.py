from django.core.management.base import BaseCommand
from cms.models import *
class Command(BaseCommand):
    help='Seed the CMS with starter construction-company content.'
    def handle(self,*args,**kwargs):
        SiteSetting.objects.update_or_create(pk=1,defaults={'company_name':'Atlas Construct','primary_phone':'+255 700 000 000','email':'hello@atlas.example','location':'Dar es Salaam, Tanzania','working_days':'Monday – Saturday','working_hours':'08:00 – 17:00','footer_text':'Building confidence, one project at a time.'})
        HeroSection.objects.get_or_create(title='We build your future.',defaults={'subtitle':'Engineering · Construction · Consultancy','description':'Premium delivery from first idea through practical completion.'})
        AboutSection.objects.get_or_create(title='Built on capability and trust',defaults={'description':'Atlas Construct brings engineers, designers, and construction specialists together around the result that matters: work built to last.','bullet_points':['Excellence','Partnership with clients','Commitment','Professional team']})
        for n,d in [('Vision','To shape dependable places that improve daily life.'),('Mission','To deliver safe, accurate, and considered construction.'),('Focus','Clear communication and quality at every stage.')]: InfoCard.objects.get_or_create(type=n.lower(),title=n,defaults={'description':d})
        for i,title in enumerate(['Building Construction','Buildings Renew','Interior & Exterior Design','Buildings Renovation','Architectural Design','Project Management']): Service.objects.get_or_create(slug=title.lower().replace(' ','-').replace('&','and'),defaults={'title':title,'short_description':f'Professional {title.lower()} services for ambitious projects.','full_description':f'Our {title.lower()} team provides a disciplined, practical service tailored to your objectives.','category':'Construction','display_order':i})
        for i,(label,value,suffix) in enumerate([('Happy Clients',120,'+'),('Projects',86,'+'),('Years of Experience',15,'+'),('Team Members',28,'+')]): Statistic.objects.get_or_create(label=label,defaults={'value':value,'suffix':suffix,'display_order':i})
        self.stdout.write(self.style.SUCCESS('CMS starter content is ready.'))
