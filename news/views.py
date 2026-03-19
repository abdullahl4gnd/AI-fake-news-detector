from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import NewsSubmission
from .serializers import NewsSubmissionSerializer
from rest_framework.decorators import parser_classes

# logic that runs when an API endpoint is called.

@api_view(['GET'])
def test_news_api(request):
    return Response({
        'message': 'News API is working'
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_submission(request):
    data = request.data.copy()

    data['text_fake_score'] = 25
    data['image_fake_score'] = 15
    data['final_fake_score'] = 21
    data['credibility_score'] = 79
    data['final_label'] = 'Fake'
    data['suspicious_words'] = 'breaking, shocking, unbelievable'
    data['explanation'] = 'testing the result page.'

    serializer = NewsSubmissionSerializer(data=data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_submissions(request):
    submissions = NewsSubmission.objects.filter(user=request.user).order_by('-created_at')
    serializer = NewsSubmissionSerializer(submissions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    submissions = NewsSubmission.objects.filter(user=request.user)

    total_submissions = submissions.count()
    fake_count = submissions.filter(final_label='Fake').count()
    real_count = submissions.filter(final_label='Real').count()

    latest_submissions = list(
        submissions.order_by('-created_at').values('id', 'title', 'final_label')[:3]
    )

    return Response({
        'total_submissions': total_submissions,
        'fake_count': fake_count,
        'real_count': real_count,
        'latest_submissions': latest_submissions,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def submission_detail(request, submission_id):
    try:
        submission = NewsSubmission.objects.get(id=submission_id, user=request.user)
    except NewsSubmission.DoesNotExist:
        return Response(
            {'error': 'Submission not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = NewsSubmissionSerializer(submission)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_submission(request, submission_id):
    try:
        submission = NewsSubmission.objects.get(id=submission_id, user=request.user)
    except NewsSubmission.DoesNotExist:
        return Response(
            {'error': 'Submission not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = NewsSubmissionSerializer(submission, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_submission(request, submission_id):
    try:
        submission = NewsSubmission.objects.get(id=submission_id, user=request.user)
    except NewsSubmission.DoesNotExist:
        return Response(
            {'error': 'Submission not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    submission.delete()
    return Response(
        {'message': 'Submission deleted successfully'},
        status=status.HTTP_200_OK
    )

