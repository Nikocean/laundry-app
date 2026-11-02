/// Local backend by default. Never ship a production URL as the fallback.
///
/// Override for staging/production:
/// `flutter run --dart-define=API_BASE_URL=https://your-api.example.com`
///
/// Android emulator → host machine: `--dart-define=API_BASE_URL=http://10.0.2.2:3000`
const String apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:3000',
);

String normalizedApiBaseUrl() {
  if (apiBaseUrl.endsWith('/')) {
    return apiBaseUrl.substring(0, apiBaseUrl.length - 1);
  }
  return apiBaseUrl;
}
