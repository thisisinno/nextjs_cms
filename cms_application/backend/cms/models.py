from django.core.validators import FileExtensionValidator
from django.db import models

image_validator = FileExtensionValidator(['jpg','jpeg','png','webp'])
class ImageModel(models.Model):
    image = models.ImageField(upload_to='cms/', blank=True, null=True, validators=[image_validator])
    class Meta: abstract = True
class SiteSetting(ImageModel):
    company_name=models.CharField(max_length=160, default='Atlas Construct')
    logo=models.ImageField(upload_to='branding/', blank=True, null=True, validators=[image_validator])
    primary_phone=models.CharField(max_length=40); secondary_phone=models.CharField(max_length=40, blank=True)
    email=models.EmailField(); location=models.CharField(max_length=160); address=models.TextField(blank=True)
    working_days=models.CharField(max_length=100, blank=True); working_hours=models.CharField(max_length=100, blank=True); footer_text=models.CharField(max_length=255, blank=True)
    footer_text_sw=models.CharField(max_length=255, blank=True); working_days_sw=models.CharField(max_length=100, blank=True); working_hours_sw=models.CharField(max_length=100, blank=True); location_sw=models.CharField(max_length=160, blank=True); address_sw=models.TextField(blank=True)
    facebook_url=models.URLField(blank=True); instagram_url=models.URLField(blank=True); whatsapp_number=models.CharField(max_length=40, blank=True)
    def save(self,*args,**kwargs): self.pk=1; return super().save(*args,**kwargs)
class HeroSection(ImageModel):
    title=models.CharField(max_length=200); subtitle=models.CharField(max_length=200, blank=True); description=models.TextField(blank=True)
    title_sw=models.CharField(max_length=200, blank=True); subtitle_sw=models.CharField(max_length=200, blank=True); description_sw=models.TextField(blank=True)
    background_image=models.ImageField(upload_to='hero/', blank=True, null=True, validators=[image_validator])
    primary_button_text=models.CharField(max_length=50, default='Explore Services'); primary_button_link=models.CharField(max_length=200, default='/services')
    secondary_button_text=models.CharField(max_length=50, default='Request Quotation'); secondary_button_link=models.CharField(max_length=200, default='/contact'); is_active=models.BooleanField(default=True)
class AboutSection(ImageModel):
    title=models.CharField(max_length=200); description=models.TextField(); bullet_points=models.JSONField(default=list, blank=True); is_active=models.BooleanField(default=True)
    title_sw=models.CharField(max_length=200, blank=True); description_sw=models.TextField(blank=True); bullet_points_sw=models.JSONField(default=list, blank=True)
class InfoCard(ImageModel):
    TYPES=[('vision','Vision'),('mission','Mission'),('focus','Focus'),('value','Value')]
    type=models.CharField(max_length=20, choices=TYPES); title=models.CharField(max_length=160); description=models.TextField(); icon=models.CharField(max_length=80, blank=True); display_order=models.PositiveIntegerField(default=0); is_active=models.BooleanField(default=True)
    class Meta: ordering=['display_order','id']
class Service(ImageModel):
    title=models.CharField(max_length=160); slug=models.SlugField(unique=True); short_description=models.TextField(); full_description=models.TextField(); icon=models.CharField(max_length=80, blank=True); category=models.CharField(max_length=80, blank=True); image_external_url=models.URLField(blank=True); is_active=models.BooleanField(default=True); display_order=models.PositiveIntegerField(default=0); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    title_sw=models.CharField(max_length=160, blank=True); short_description_sw=models.TextField(blank=True); full_description_sw=models.TextField(blank=True); category_sw=models.CharField(max_length=80, blank=True)
    class Meta: ordering=['display_order','title']
class Project(ImageModel):
    CATEGORIES=[('completed','Completed'),('ongoing','Ongoing'),('daily','Daily'),('featured','Featured')]
    title=models.CharField(max_length=180); slug=models.SlugField(unique=True); category=models.CharField(max_length=20, choices=CATEGORIES); description=models.TextField(); status=models.CharField(max_length=80); location=models.CharField(max_length=160, blank=True); image_external_url=models.URLField(blank=True); start_date=models.DateField(blank=True,null=True); end_date=models.DateField(blank=True,null=True); is_featured=models.BooleanField(default=False); is_active=models.BooleanField(default=True); display_order=models.PositiveIntegerField(default=0); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    title_sw=models.CharField(max_length=180, blank=True); description_sw=models.TextField(blank=True); status_sw=models.CharField(max_length=80, blank=True); location_sw=models.CharField(max_length=160, blank=True)
    class Meta: ordering=['display_order','-created_at']
class ProjectImage(ImageModel):
    project=models.ForeignKey(Project,related_name='gallery',on_delete=models.CASCADE); caption=models.CharField(max_length=160,blank=True); display_order=models.PositiveIntegerField(default=0)
    class Meta: ordering=['display_order','id']
class Statistic(models.Model):
    label=models.CharField(max_length=80); value=models.PositiveIntegerField(); suffix=models.CharField(max_length=20,blank=True); display_order=models.PositiveIntegerField(default=0); is_active=models.BooleanField(default=True)
    label_sw=models.CharField(max_length=80, blank=True)
    class Meta: ordering=['display_order','id']
class TeamMember(ImageModel):
    name=models.CharField(max_length=120); position=models.CharField(max_length=120); message=models.TextField(blank=True); photo=models.ImageField(upload_to='team/',blank=True,null=True,validators=[image_validator]); display_order=models.PositiveIntegerField(default=0); is_active=models.BooleanField(default=True)
    position_sw=models.CharField(max_length=120, blank=True); message_sw=models.TextField(blank=True)
    class Meta: ordering=['display_order','name']
class Enquiry(models.Model):
    STATUS=[('new','New'),('viewed','Viewed'),('contacted','Contacted'),('closed','Closed')]
    full_name=models.CharField(max_length=160); phone=models.CharField(max_length=40); email=models.EmailField(blank=True); location=models.CharField(max_length=160); preferred_contact_method=models.CharField(max_length=40); message=models.TextField(blank=True); status=models.CharField(max_length=20,choices=STATUS,default='new'); admin_note=models.TextField(blank=True); created_at=models.DateTimeField(auto_now_add=True); updated_at=models.DateTimeField(auto_now=True)
    class Meta: ordering=['-created_at']
class EnquiryItem(models.Model):
    enquiry=models.ForeignKey(Enquiry,related_name='items',on_delete=models.CASCADE); service=models.ForeignKey(Service,null=True,blank=True,on_delete=models.SET_NULL); service_title_snapshot=models.CharField(max_length=160); note=models.TextField(blank=True); quantity=models.PositiveIntegerField(default=1)
class ContactMessage(models.Model):
    STATUS=[('new','New'),('viewed','Viewed'),('replied','Replied')]
    full_name=models.CharField(max_length=160); phone=models.CharField(max_length=40,blank=True); email=models.EmailField(blank=True); subject=models.CharField(max_length=200,blank=True); message=models.TextField(); status=models.CharField(max_length=20,choices=STATUS,default='new'); created_at=models.DateTimeField(auto_now_add=True)
    class Meta: ordering=['-created_at']
