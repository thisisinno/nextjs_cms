from django.conf import settings
class CorsMiddleware:
    def __init__(self,get_response): self.get_response=get_response
    def __call__(self,request):
        response=self.get_response(request); origin=request.headers.get('Origin','')
        if origin in settings.CORS_ALLOWED_ORIGINS:
            response['Access-Control-Allow-Origin']=origin; response['Access-Control-Allow-Headers']='Authorization, Content-Type'; response['Access-Control-Allow-Methods']='GET, POST, PATCH, PUT, DELETE, OPTIONS'
        return response
