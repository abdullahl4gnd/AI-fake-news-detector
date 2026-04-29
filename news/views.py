from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import NewsSubmission
from .serializers import NewsSubmissionSerializer

import pickle
import re
import os
import requests
from bs4 import BeautifulSoup
from textblob import TextBlob
from urllib.parse import urlparse
from pathlib import Path

# ================================================================
# Load ML model and vectorizer once at startup
# ================================================================
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH      = BASE_DIR / 'AI' / 'Text Models' / 'Text Model' / 'best_fake_news_model.pkl'
VECTORIZER_PATH = BASE_DIR / 'AI' / 'Text Models' / 'Text Model' / 'tfidf_vectorizer.pkl'

with open(MODEL_PATH, 'rb') as f:
    best_model = pickle.load(f)

with open(VECTORIZER_PATH, 'rb') as f:
    vectorizer = pickle.load(f)


# ================================================================
# Trusted and fake source lists
# ================================================================
TRUSTED_SOURCES = [
    'reuters.com', 'bbc.com', 'bbc.co.uk', 'apnews.com',
    'npr.org', 'theguardian.com', 'nytimes.com', 'washingtonpost.com',
    'bloomberg.com', 'wsj.com', 'time.com', 'politico.com',
    'cbsnews.com', 'nbcnews.com', 'abcnews.go.com', 'cnn.com',
    'aljazeera.com', 'dw.com', 'france24.com', 'euronews.com'
]
FAKE_SOURCES = [
    'infowars.com', 'naturalnews.com', 'breitbart.com',
    'beforeitsnews.com', 'yournewswire.com', 'worldnewsdailyreport.com',
    'nationalreport.net', 'abcnews.com.co', 'cnn.com.de'
]

SENSATIONAL_WORDS = [
    'breaking', 'shocking', 'bombshell', 'explosive', 'urgent',
    'alert', 'exposed', 'leaked', 'confirmed', 'proof', 'secret',
    'censored', 'banned', 'deleted', 'share', 'wake up', 'sheeple',
    'deep state', 'cover up', 'mainstream media', 'they dont want',
    'before they delete', 'massive', 'disgusting', 'unbelievable'
]


# ================================================================
# Helper functions
# ================================================================
def predict_text(text, confidence_threshold=0.40):
    text = re.sub(r'^[A-Z][A-Z\s,\.]{0,40}\(Reuters\)\s*..\s*', '', str(text))
    text_tfidf = vectorizer.transform([text])
    if text_tfidf.nnz == 0:
        return 'Uncertain', 50
    prob      = best_model.predict_proba(text_tfidf)[0]
    pred      = best_model.predict(text_tfidf)[0]
    confidence = prob[pred]
    if confidence < confidence_threshold:
        return 'Uncertain', 50
    label = 'Real' if pred == 1 else 'Fake'
    score = int(confidence * 100)
    return label, score


def get_sentiment(text):
    blob         = TextBlob(text)
    subjectivity = blob.sentiment.subjectivity
    text_lower   = text.lower()
    found_words  = [w for w in SENSATIONAL_WORDS if w in text_lower]
    exclamations = text.count('!')
    caps_words   = [w for w in text.split() if w.isupper() and len(w) > 2]
    sensational  = min(len(found_words) * 10 + exclamations * 5 + len(caps_words) * 5, 100)
    fake_indicator = int(subjectivity * 40 + (sensational / 100) * 60)
    return fake_indicator, found_words


def get_source_score(url):
    if not url:
        return 50, 'No URL'
    try:
        domain = urlparse(url).netloc.replace('www.', '')
        for s in TRUSTED_SOURCES:
            if s in domain:
                return 100, f'Trusted ({domain})'
        for s in FAKE_SOURCES:
            if s in domain:
                return 0, f'Unreliable ({domain})'
        return 40, f'Unknown ({domain})'
    except:
        return 50, 'Unknown'


def scrape_url(url):
    try:
        headers  = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        soup     = BeautifulSoup(response.text, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
            tag.decompose()
        article = soup.find('article')
        if article:
            text = article.get_text(separator=' ')
        else:
            text = ' '.join([p.get_text() for p in soup.find_all('p')])
        return ' '.join(text.split())
    except:
        return None


def compute_credibility(text_label, text_confidence, sentiment_score, source_score, has_url):
    if text_label == 'Real':
        text_credibility = text_confidence
    elif text_label == 'Fake':
        text_credibility = 100 - text_confidence
    else:
        text_credibility = 50

    sentiment_credibility = 100 - sentiment_score

    if has_url:
        combined = int(text_credibility * 0.50 + sentiment_credibility * 0.30 + source_score * 0.20)
    else:
        combined = int(text_credibility * 0.60 + sentiment_credibility * 0.40)

    if combined >= 70:
        final_label = 'Real'
    elif combined >= 40:
        final_label = 'Uncertain'
    else:
        final_label = 'Fake'

    return combined, final_label


# ================================================================
# API Views
# ================================================================
@api_view(['GET'])
def test_news_api(request):
    return Response({'message': 'News API is working'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def create_submission(request):
    article_text = request.data.get('article_text', '')
    url          = request.data.get('url', '')
    image        = request.FILES.get('image', None)

    # If URL provided — scrape text from it
    if url and not article_text:
        scraped = scrape_url(url)
        if scraped:
            article_text = scraped

    # If image provided — extract text using EasyOCR
    if image and not article_text:
        try:
            import easyocr
            import tempfile
            reader = easyocr.Reader(['en'])
            with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                for chunk in image.chunks():
                    tmp.write(chunk)
                tmp_path = tmp.name
            results     = reader.readtext(tmp_path)
            article_text = ' '.join([t for (_, t, c) in results if c > 0.3])
            os.unlink(tmp_path)
        except Exception as e:
            return Response({'error': f'OCR failed: {str(e)}'}, status=400)

    if not article_text:
        return Response({'error': 'No text, image, or URL provided'}, status=400)

    # Run all models
    text_label, text_confidence     = predict_text(article_text)
    sentiment_score, suspicious_words = get_sentiment(article_text)
    source_score, source_label      = get_source_score(url)
    credibility_score, final_label  = compute_credibility(
        text_label, text_confidence, sentiment_score, source_score, bool(url)
    )

    # Build explanation
    explanation = (
        f'Text model: {text_label} ({text_confidence}% confidence). '
        f'Source: {source_label}. '
        f'Sentiment score: {sentiment_score}/100 fake indicators.'
    )

    data = request.data.copy()
    data['article_text']    = article_text
    data['text_fake_score'] = text_confidence if text_label == 'Fake' else 100 - text_confidence
    data['image_fake_score']= 0
    data['final_fake_score']= 100 - credibility_score
    data['credibility_score']= credibility_score
    data['final_label']     = final_label
    data['suspicious_words']= ', '.join(suspicious_words[:10])
    data['explanation']     = explanation

    serializer = NewsSubmissionSerializer(data=data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_submissions(request):
    submissions = NewsSubmission.objects.filter(user=request.user).order_by('-created_at')
    serializer  = NewsSubmissionSerializer(submissions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    submissions = NewsSubmission.objects.filter(user=request.user)
    total       = submissions.count()
    fake_count  = submissions.filter(final_label='Fake').count()
    real_count  = submissions.filter(final_label='Real').count()
    latest      = list(submissions.order_by('-created_at').values('id', 'final_label')[:3])

    return Response({
        'total_submissions': total,
        'fake_count':        fake_count,
        'real_count':        real_count,
        'latest_submissions': latest,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def submission_detail(request, submission_id):
    try:
        submission = NewsSubmission.objects.get(id=submission_id, user=request.user)
    except NewsSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = NewsSubmissionSerializer(submission)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_submission(request, submission_id):
    try:
        submission = NewsSubmission.objects.get(id=submission_id, user=request.user)
    except NewsSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)

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
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)

    submission.delete()
    return Response({'message': 'Submission deleted successfully'}, status=status.HTTP_200_OK)