from django.contrib import admin
from .models import Restitutions, Formats, Jointures, Filtre_populations, Affichages, Operations, Conditions, Champs 

class RestitutionAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Restitutions._meta.fields]
    
class CodeFormatAdmin (admin.ModelAdmin):
    list_display = [field.name for field in Formats._meta.fields]

class JointuresAdmin (admin.ModelAdmin):
    list_display = [field.name for field in Jointures._meta.fields]
    
class FiltrePopulationsAdmin (admin.ModelAdmin):
    list_display = [field.name for field in Filtre_populations._meta.fields]
    
class AffichagesAdmin (admin.ModelAdmin):
    list_display = [field.name for field in Affichages._meta.fields]
    
class OperationsAdmin (admin.ModelAdmin):
    list_display = [field.name for field in Operations._meta.fields]
    
class ConditionOperationAdmin (admin.ModelAdmin):
    list_display = [field.name for field in Conditions._meta.fields]
    
class ChampsAdmin (admin.ModelAdmin):
    list_display = [field.name for field in Champs._meta.fields]


admin.site.register(Restitutions, RestitutionAdmin)
admin.site.register(Formats, CodeFormatAdmin)
admin.site.register(Jointures, JointuresAdmin)
admin.site.register(Filtre_populations, FiltrePopulationsAdmin)
admin.site.register(Affichages, AffichagesAdmin)
admin.site.register(Operations, OperationsAdmin)
admin.site.register(Conditions, ConditionOperationAdmin)
admin.site.register(Champs, ChampsAdmin)