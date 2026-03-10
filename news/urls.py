from django.urls import path
from .views import test_news_api, create_submission, list_submissions , submission_detail, update_submission, delete_submission, create_submission_json , dashboard_summary

urlpatterns = [
    path('test/', test_news_api, name='news-test'),
    path('create/', create_submission, name='create-submission'),
    path('list/', list_submissions, name='list-submissions'),
    path('<int:submission_id>/', submission_detail, name='submission-detail'),
    path('<int:submission_id>/update/', update_submission, name='update-submission'),
    path('<int:submission_id>/delete/', delete_submission, name='delete-submission'),
    path('create-json/', create_submission_json, name='create-submission-json'),
    path('dashboard-summary/', dashboard_summary, name='dashboard-summary'),
]