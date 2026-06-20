from django.contrib import admin
from .models import *
for m in [SiteSetting,HeroSection,AboutSection,InfoCard,Service,Project,ProjectImage,Statistic,TeamMember,Enquiry,EnquiryItem,ContactMessage]: admin.site.register(m)
