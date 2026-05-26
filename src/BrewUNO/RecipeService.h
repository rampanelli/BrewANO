#ifndef RecipeService_h
#define RecipeService_h

#if defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#elif defined(ESP_PLATFORM)
#include <WiFi.h>
#include <AsyncTCP.h>
#endif

#include <ESPAsyncWebServer.h>
#include <AsyncArduinoJson6.h>
#include <AsyncJsonWebHandler.h>
#include <ArduinoJson.h>
#include <FS.h>

#define MAX_RECIPE_SIZE 3072
#define MAX_RECIPES 100

#define RECIPES_INDEX_FILE "/config/recipes.json"
#define RECIPE_PATH_PREFIX "/config/recipes/r_"

#define LIST_RECIPES_PATH "/rest/listRecipes"
#define GET_RECIPE_PATH "/rest/getRecipe"
#define SAVE_RECIPE_PATH "/rest/saveRecipe"
#define DELETE_RECIPE_PATH "/rest/deleteRecipe"
#define ACTIVATE_RECIPE_PATH "/rest/activateRecipe"

class RecipeService
{
public:
  RecipeService(AsyncWebServer *server, FS *fs);

private:
  FS *_fs;
  AsyncWebServer *_server;
  AsyncJsonWebHandler _saveHandler;

  String getRecipePath(int id);
  int getNextId();
  String getIndexJson();

  void listRecipes(AsyncWebServerRequest *request);
  void getRecipe(AsyncWebServerRequest *request);
  void saveRecipe(AsyncWebServerRequest *request, JsonDocument &json);
  void deleteRecipe(AsyncWebServerRequest *request);
  void activateRecipe(AsyncWebServerRequest *request);
};

#endif
