#ifndef HeaterService_h
#define HeaterService_h

#include <BrewUNO/TemperatureService.h>
#include <BrewUNO/ActiveStatus.h>
#include <PID_v1.h>
#include <PID_AutoTune_v0.h>
#include <BrewUNO/enum.h>
#include <BrewUNO/BrewSettingsService.h>

#define SSR_HALF_CYCLE_MS 10
#define SSR_CYCLES 100
#define SSR_WINDOW_MS (SSR_HALF_CYCLE_MS * SSR_CYCLES)
#define PWM_MAX 1023

struct HeaterServiceStatus
{
  double PWM;
  double PWMPercentage;
  boolean PIDActing;
};

class HeaterService
{
public:
  HeaterService(TemperatureService *temperatureService,
                ActiveStatus *activeStatus,
                BrewSettingsService *brewSettingsService) : _temperatureService(temperatureService),
                                                            _activeStatus(activeStatus),
                                                            _brewSettingsService(brewSettingsService)

  {
  }

  HeaterServiceStatus Compute(double input, double target, double heaterPercentage)
  {
    HeaterServiceStatus status;
    uint8_t _heaterBus = GetBus();
    SetUP();
    if (StopCompute())
    {
      status.PIDActing = false;
      status.PWM = 0;
      status.PWMPercentage = 0;
      TurnOff();
      return status;
    }

    SetPidParameters(input, target);

    if (_activeStatus->PIDSettingsUpdated)
    {
      _activeStatus->PIDSettingsUpdated = false;
      StartPID(_brewSettingsService->KP, _brewSettingsService->KI, _brewSettingsService->KD);
      Serial.println("BrewSettings Updated: " + String(_brewSettingsService->KP) + "/" + String(_brewSettingsService->KI) + "/" + String(_brewSettingsService->KD));
      return status;
    }

    if (_activeStatus->ActiveStep == boil)
    {
      status.PIDActing = false;
      status.PWM = ((PWM_MAX * _brewSettingsService->BoilPowerPercentage) / 100);
      status.PWMPercentage = (status.PWM * 100) / PWM_MAX;
      ApplyOutput(_heaterBus, status.PWM);
      return status;
    }

    if (_activeStatus->FullPower)
      heaterPercentage = 100;

    if (GetPidSetPoint() - GetPidInput() > _brewSettingsService->PIDStart)
    {
      status.PIDActing = false;
      status.PWM = ((PWM_MAX * heaterPercentage) / 100);
      status.PWMPercentage = (status.PWM * 100) / PWM_MAX;
      ApplyOutput(_heaterBus, status.PWM);
      return status;
    }

    if (GetPidInput() > GetPidSetPoint() + 0.1)
    {
      status.PWM = 0;
      status.PWMPercentage = 0;
      status.PIDActing = false;
      ApplyOutput(_heaterBus, 0);
      StartPID(_brewSettingsService->KP, _brewSettingsService->KI, _brewSettingsService->KD);
      return status;
    }

    PidCompute();

    int maxPWM = ((PWM_MAX * heaterPercentage) / 100);
    status.PWM = GetPidOutput() > maxPWM ? maxPWM : GetPidOutput();
    status.PWMPercentage = (status.PWM * 100) / PWM_MAX;

    ApplyOutput(_heaterBus, status.PWM);

    status.PIDActing = status.PWM > 0;
    return status;
  }

protected:
  virtual void SetUP();
  virtual boolean StopCompute();
  virtual void StartPID(double kp, double ki, double kd);
  virtual void PidCompute();
  virtual double GetPidOutput();
  virtual double GetPidInput();
  virtual double GetPidSetPoint();
  virtual uint8_t GetBus();
  virtual void TurnOff();
  virtual bool InvertedPWM();
  virtual void SetPidParameters(double input, double setpoint);

  void ApplyOutput(uint8_t bus, double pwmValue)
  {
    unsigned long now_ms = millis();
    if (_windowStartTime == 0 || now_ms - _windowStartTime >= SSR_WINDOW_MS)
    {
      _windowStartTime = now_ms;
      _onCycles = (uint16_t)((InvertedPWM() ? (PWM_MAX - pwmValue) : pwmValue) * SSR_CYCLES / PWM_MAX);
    }
    uint16_t currentCycle = (uint16_t)((now_ms - _windowStartTime) / SSR_HALF_CYCLE_MS);
    if (currentCycle >= SSR_CYCLES) currentCycle = SSR_CYCLES - 1;
    bool on = ((uint32_t)currentCycle * _onCycles) % SSR_CYCLES < _onCycles;
    digitalWrite(bus, on ? HIGH : LOW);
  }

  TemperatureService *_temperatureService;
  ActiveStatus *_activeStatus;
  BrewSettingsService *_brewSettingsService;
  PID *_kettlePID;
  unsigned long _windowStartTime = 0;
  uint16_t _onCycles = 0;
};
#endif