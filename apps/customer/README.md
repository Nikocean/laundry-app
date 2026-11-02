# laundry_customer

Flutter customer app.

## API base URL

Defaults to `http://localhost:3000`. Do **not** bake a production URL into source.

```bash
# Local (iOS simulator / desktop)
flutter run

# Android emulator → host machine backend
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000

# Staging / production (pass explicitly at build/run time)
flutter run --dart-define=API_BASE_URL=https://your-api.example.com
flutter build apk --dart-define=API_BASE_URL=https://your-api.example.com
```
