"""
Health check views for load balancer monitoring
"""
import os
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.db import connections
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_GET
def health_check(request):
    """Basic health check endpoint"""
    server_id = os.getenv('SERVER_ID', 'unknown')
    return JsonResponse({
        'status': 'healthy',
        'server_id': server_id
    })

@csrf_exempt
@require_GET
def detailed_health_check(request):
    """Detailed health check with database and cache verification"""
    health_status = {
        'server_id': os.getenv('SERVER_ID', 'unknown'),
        'status': 'healthy',
        'checks': {}
    }
    
    # Check Master database
    try:
        master_conn = connections['default']
        master_conn.ensure_connection()
        health_status['checks']['database_master'] = 'ok'
    except Exception as e:
        health_status['checks']['database_master'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
        logger.error(f"Master database health check failed: {e}")
    
    # Check Slave database
    try:
        slave_conn = connections['slave']
        slave_conn.ensure_connection()
        health_status['checks']['database_slave'] = 'ok'
    except Exception as e:
        health_status['checks']['database_slave'] = f'error: {str(e)}'
        health_status['status'] = 'degraded'
        logger.warning(f"Slave database health check failed: {e}")
    
    # Check Redis cache
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            health_status['checks']['cache'] = 'ok'
        else:
            health_status['checks']['cache'] = 'error: cache write/read failed'
            health_status['status'] = 'degraded'
    except Exception as e:
        health_status['checks']['cache'] = f'error: {str(e)}'
        health_status['status'] = 'degraded'
        logger.warning(f"Cache health check failed: {e}")
    
    status_code = 200 if health_status['status'] == 'healthy' else 503
    return JsonResponse(health_status, status=status_code)

@csrf_exempt
@require_GET  
def readiness_check(request):
    """Readiness check for load balancer"""
    try:
        master_conn = connections['default']
        master_conn.ensure_connection()
        
        return JsonResponse({
            'ready': True,
            'server_id': os.getenv('SERVER_ID', 'unknown')
        })
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JsonResponse({
            'ready': False,
            'error': str(e),
            'server_id': os.getenv('SERVER_ID', 'unknown')
        }, status=503)

@csrf_exempt
@require_GET
def liveness_check(request):
    """Liveness check"""
    return JsonResponse({
        'alive': True,
        'server_id': os.getenv('SERVER_ID', 'unknown')
    })