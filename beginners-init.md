# Super Prosty Przewodnik dla Początkujących

Ten przewodnik przeprowadzi Cię przez proces instalacji i uruchomienia aplikacji Voice Shopping List, nawet jeśli nigdy wcześniej nie korzystałeś/aś z terminala czy programów komputerowych tego typu. Każdy krok jest szczegółowo objaśniony.

## Wymagania wstępne

Na Twoim komputerze powinny być już zainstalowane:
- Node.js (wersja 18)
- pnpm
- git

Jeśli te programy nie są zainstalowane, poproś osobę techniczną o pomoc przy ich instalacji.

## Krok 1: Pobieranie kodu

1. **Uruchom terminal**
   - Na Windows: wciśnij `Win + R`, wpisz `cmd` i kliknij OK
   - Na Mac: naciśnij `Cmd + Space`, wpisz `Terminal` i naciśnij Enter
   - Na Linux: naciśnij `Ctrl + Alt + T`

2. **Przejdź do folderu, gdzie chcesz zapisać projekt**
   ```
   cd Desktop
   ```

3. **Pobierz kod z GitHub**
   ```
   git clone https://github.com/Szowesgad/voice-shopping-list.git
   ```

4. **Przejdź do folderu projektu**
   ```
   cd voice-shopping-list
   ```

## Krok 2: Konfiguracja modelu AI do rozpoznawania mowy

1. **Przejdź do folderu serwera**
   ```
   cd server
   ```

2. **Nadaj uprawnienia do wykonania skryptu**
   ```
   chmod +x model_init.sh
   ```

3. **Uruchom skrypt instalacyjny modelu**
   ```
   ./model_init.sh
   ```

4. **Co się wydarzy:**
   - Zostaniesz poproszony o wybór rozmiaru modelu (wybierz 1, 2 lub 3)
   - Model zostanie pobrany (to może zająć kilka minut)
   - Zostaniesz zapytany, czy chcesz skompilować program (wpisz Y)
   - Zaczekaj cierpliwie, aż proces zakończy się komunikatem "Model initialization completed successfully"

## Krok 3: Uruchomienie serwera rozpoznawania mowy

1. **Nadaj uprawnienia do wykonania drugiego skryptu**
   ```
   chmod +x server_init.sh
   ```

2. **Uruchom skrypt serwera**
   ```
   ./server_init.sh
   ```

3. **Co się wydarzy:**
   - Automatycznie zostaną zainstalowane wszystkie potrzebne pakiety
   - Serwer się uruchomi i wyświetli komunikaty o postępie
   - **WAŻNE: Pozostaw to okno terminala otwarte i działające!**

## Krok 4: Uruchomienie interfejsu aplikacji (w nowym oknie terminala)

1. **Otwórz nowe okno terminala**
   - Na Windows: ponownie otwórz cmd jak w kroku 1
   - Na Mac: naciśnij `Cmd + T` w istniejącym oknie terminala lub otwórz nowe
   - Na Linux: naciśnij `Ctrl + Alt + T` lub otwórz nowy terminal

2. **Przejdź do folderu projektu**
   ```
   cd Desktop/voice-shopping-list
   ```

3. **Nadaj uprawnienia do wykonania skryptu instalacyjnego**
   ```
   chmod +x installation.sh
   ```

4. **Uruchom skrypt instalacyjny interfejsu**
   ```
   ./installation.sh
   ```

5. **Co się wydarzy:**
   - Sprawdzone zostanie, czy serwer działa (powinien, jeśli wykonałeś/aś krok 3)
   - Zainstalowane zostaną wszystkie potrzebne pakiety
   - Uruchomi się interfejs aplikacji

## Krok 5: Korzystanie z aplikacji

1. **Otwórz przeglądarkę internetową** (np. Chrome, Firefox, Edge)

2. **Wpisz w pasek adresu:**
   ```
   http://localhost:3000
   ```

3. **Teraz możesz korzystać z aplikacji:**
   - Kliknij "Start Recording" aby nagrać głos
   - Powiedz swoje produkty na listę zakupów (np. "mleko, chleb, masło")
   - Kliknij "Stop Recording" aby zakończyć nagrywanie
   - Twoja lista zakupów pojawi się automatycznie!

## Rozwiązywanie problemów

### Problem: Skrypt nie chce się uruchomić
- Upewnij się, że użyłeś/aś komendy `chmod +x nazwa_skryptu.sh` przed uruchomieniem
- Upewnij się, że znajdujesz się w odpowiednim folderze

### Problem: Serwer nie działa 
- Upewnij się, że okno terminala z serwerem jest nadal otwarte
- Sprawdź, czy wyświetlany jest komunikat o działającym serwerze

### Problem: Przeglądarka pokazuje błąd
- Sprawdź, czy oba terminale (serwer i interfejs) są uruchomione
- Upewnij się, że wpisałeś/aś poprawny adres: http://localhost:3000

### Problem: Rozpoznawanie mowy nie działa
- Upewnij się, że Twoja przeglądarka ma dostęp do mikrofonu
- Spróbuj przełączyć metodę rozpoznawania w menu rozwijanym (Browser API lub Vista API)

## Zakończenie korzystania z aplikacji

Gdy skończysz korzystać z aplikacji:

1. **Zamknij przeglądarkę** lub kartę z aplikacją

2. **Zakończ działanie serwerów** naciskając `Ctrl + C` w obu oknach terminala

3. **Zamknij okna terminala**

## Ponowne uruchomienie aplikacji

Jeśli chcesz ponownie uruchomić aplikację później:

1. Otwórz dwa okna terminala
2. W pierwszym wykonaj:
   ```
   cd Desktop/voice-shopping-list/server
   ./server_init.sh
   ```
3. W drugim wykonaj:
   ```
   cd Desktop/voice-shopping-list
   ./installation.sh
   ```

Gotowe! 🎉 Twoja aplikacja Voice Shopping List powinna działać bez problemu!
