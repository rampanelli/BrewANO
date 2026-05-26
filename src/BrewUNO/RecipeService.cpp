#include <BrewUNO/RecipeService.h>

RecipeService::RecipeService(AsyncWebServer *server, FS *fs)
    : _server(server), _fs(fs)
{
  _server->on(LIST_RECIPES_PATH, HTTP_GET, std::bind(&RecipeService::listRecipes, this, std::placeholders::_1));
  _server->on(GET_RECIPE_PATH, HTTP_GET, std::bind(&RecipeService::getRecipe, this, std::placeholders::_1));
  _server->on(DELETE_RECIPE_PATH, HTTP_DELETE, std::bind(&RecipeService::deleteRecipe, this, std::placeholders::_1));
  _server->on(ACTIVATE_RECIPE_PATH, HTTP_POST, std::bind(&RecipeService::activateRecipe, this, std::placeholders::_1));

  _saveHandler.setUri(SAVE_RECIPE_PATH);
  _saveHandler.setMethod(HTTP_POST);
  _saveHandler.setMaxContentLength(MAX_RECIPE_SIZE);
  _saveHandler.onRequest(std::bind(&RecipeService::saveRecipe, this, std::placeholders::_1, std::placeholders::_2));
  _server->addHandler(&_saveHandler);
}

String RecipeService::getRecipePath(int id)
{
  return String(RECIPE_PATH_PREFIX) + String(id) + ".json";
}

int RecipeService::getNextId()
{
  File indexFile = _fs->open(RECIPES_INDEX_FILE, "r");
  if (!indexFile)
  {
    return 1;
  }

  DynamicJsonDocument doc(4096);
  DeserializationError error = deserializeJson(doc, indexFile);
  indexFile.close();

  if (error)
  {
    return 1;
  }

  JsonArray recipes = doc["recipes"].as<JsonArray>();
  int maxId = 0;
  for (JsonObject r : recipes)
  {
    int id = r["id"] | 0;
    if (id > maxId)
      maxId = id;
  }
  return maxId + 1;
}

String RecipeService::getIndexJson()
{
  File indexFile = _fs->open(RECIPES_INDEX_FILE, "r");
  if (!indexFile)
  {
    return "{\"recipes\":[]}";
  }

  String content = indexFile.readString();
  indexFile.close();
  return content.length() > 0 ? content : "{\"recipes\":[]}";
}

void RecipeService::listRecipes(AsyncWebServerRequest *request)
{
  String indexJson = getIndexJson();
  AsyncJsonResponse *response = new AsyncJsonResponse(4096);
  JsonObject root = response->getRoot();

  DynamicJsonDocument indexDoc(2048);
  DeserializationError error = deserializeJson(indexDoc, indexJson);
  if (!error)
  {
    JsonArray recipes = root.createNestedArray("recipes");
    JsonArray srcRecipes = indexDoc["recipes"].as<JsonArray>();
    for (JsonObject src : srcRecipes)
    {
      JsonObject dst = recipes.createNestedObject();
      dst["id"] = src["id"];
      dst["name"] = src["name"];
      if (src.containsKey("createdAt"))
        dst["createdAt"] = src["createdAt"];
    }
  }
  else
  {
    root.createNestedArray("recipes");
  }

  response->setLength();
  request->send(response);
}

void RecipeService::getRecipe(AsyncWebServerRequest *request)
{
  String idParam = "";
  if (request->hasParam("id"))
  {
    idParam = request->getParam("id")->value();
  }

  if (idParam.length() == 0)
  {
    request->send(400, "text/plain", "Missing id parameter");
    return;
  }

  int id = idParam.toInt();
  String path = getRecipePath(id);
  File recipeFile = _fs->open(path, "r");

  if (!recipeFile)
  {
    request->send(404, "text/plain", "Recipe not found");
    return;
  }

  AsyncJsonResponse *response = new AsyncJsonResponse(MAX_RECIPE_SIZE);
  JsonObject root = response->getRoot();

  DynamicJsonDocument doc(MAX_RECIPE_SIZE);
  DeserializationError error = deserializeJson(doc, recipeFile);
  recipeFile.close();

  if (!error)
  {
    JsonObject src = doc.as<JsonObject>();
    root["id"] = src["id"];
    root["name"] = src["name"];
    root["mashSteps"] = src["mashSteps"];
    root["boilSteps"] = src["boilSteps"];
    root["brewSettings"] = src["brewSettings"];
    if (src.containsKey("beerParams"))
      root["beerParams"] = src["beerParams"];
    if (src.containsKey("impressions"))
      root["impressions"] = src["impressions"];
    if (src.containsKey("createdAt"))
      root["createdAt"] = src["createdAt"];
  }
  else
  {
    root["error"] = "Failed to read recipe";
  }

  response->setLength();
  request->send(response);
}

void RecipeService::saveRecipe(AsyncWebServerRequest *request, JsonDocument &json)
{
  if (!json.is<JsonObject>())
  {
    request->send(400, "text/plain", "Invalid JSON");
    return;
  }

  JsonObject recipe = json.as<JsonObject>();
  int id = recipe["id"] | 0;
  bool isNew = (id == 0);

  if (isNew)
  {
    id = getNextId();
  }

  String path = getRecipePath(id);

  DynamicJsonDocument recipeDoc(MAX_RECIPE_SIZE);
  JsonObject savedRecipe = recipeDoc.to<JsonObject>();
  savedRecipe["id"] = id;
  savedRecipe["name"] = recipe["name"];
  savedRecipe["mashSteps"] = recipe["mashSteps"];
  savedRecipe["boilSteps"] = recipe["boilSteps"];
  savedRecipe["brewSettings"] = recipe["brewSettings"];

  JsonObject beerParamsObj = recipe["beerParams"];
  if (!beerParamsObj.isNull())
  {
    JsonObject bp = savedRecipe.createNestedObject("beerParams");
    bp["ibu"] = beerParamsObj["ibu"] | 0;
    bp["abv"] = beerParamsObj["abv"] | 0.0;
    bp["cor"] = beerParamsObj["cor"] | 0.0;
    bp["fg"] = beerParamsObj["fg"] | 0.0;
  }

  const char *impressions = recipe["impressions"];
  if (impressions != nullptr)
  {
    savedRecipe["impressions"] = impressions;
  }

  unsigned long now = recipe["createdAt"] | 0;
  if (now == 0)
  {
    if (!isNew)
    {
      File existingFile = _fs->open(path, "r");
      if (existingFile)
      {
        DynamicJsonDocument existingDoc(MAX_RECIPE_SIZE);
        DeserializationError err = deserializeJson(existingDoc, existingFile);
        existingFile.close();
        if (!err)
        {
          JsonObject existing = existingDoc.as<JsonObject>();
          now = existing["createdAt"] | 0;
        }
      }
    }
    if (now == 0)
      now = millis();
  }
  savedRecipe["createdAt"] = now;

  File recipeFile = _fs->open(path, "w");
  if (!recipeFile)
  {
    request->send(500, "text/plain", "Failed to write recipe file");
    return;
  }
  serializeJson(recipeDoc, recipeFile);
  recipeFile.close();

  if (isNew)
  {
    String indexJson = getIndexJson();
    DynamicJsonDocument indexDoc(4096);
    deserializeJson(indexDoc, indexJson);
    JsonArray recipes = indexDoc["recipes"].as<JsonArray>();

    JsonObject entry = recipes.createNestedObject();
    entry["id"] = id;
    entry["name"] = recipe["name"];
    entry["createdAt"] = now;

    if (recipes.size() > MAX_RECIPES)
    {
      recipes.remove(0);
    }

    File indexFile = _fs->open(RECIPES_INDEX_FILE, "w");
    if (indexFile)
    {
      serializeJson(indexDoc, indexFile);
      indexFile.close();
    }
  }
  else
  {
    String indexJson = getIndexJson();
    DynamicJsonDocument indexDoc(4096);
    deserializeJson(indexDoc, indexJson);
    JsonArray recipes = indexDoc["recipes"].as<JsonArray>();
    for (JsonObject entry : recipes)
    {
      if (entry["id"] == id)
      {
        entry["name"] = recipe["name"];
        break;
      }
    }
    File indexFile = _fs->open(RECIPES_INDEX_FILE, "w");
    if (indexFile)
    {
      serializeJson(indexDoc, indexFile);
      indexFile.close();
    }
  }

  AsyncJsonResponse *response = new AsyncJsonResponse(256);
  JsonObject root = response->getRoot();
  root["id"] = id;
  root["name"] = recipe["name"];
  response->setLength();
  request->send(response);
}

void RecipeService::deleteRecipe(AsyncWebServerRequest *request)
{
  String idParam = "";
  if (request->hasParam("id"))
  {
    idParam = request->getParam("id")->value();
  }

  if (idParam.length() == 0)
  {
    request->send(400, "text/plain", "Missing id parameter");
    return;
  }

  int id = idParam.toInt();
  String path = getRecipePath(id);
  _fs->remove(path);

  String indexJson = getIndexJson();
  DynamicJsonDocument indexDoc(4096);
  deserializeJson(indexDoc, indexJson);
  JsonArray recipes = indexDoc["recipes"].as<JsonArray>();

  int removeIndex = -1;
  for (int i = 0; i < recipes.size(); i++)
  {
    if (recipes[i]["id"] == id)
    {
      removeIndex = i;
      break;
    }
  }
  if (removeIndex >= 0)
  {
    recipes.remove(removeIndex);
  }

  File indexFile = _fs->open(RECIPES_INDEX_FILE, "w");
  if (indexFile)
  {
    serializeJson(indexDoc, indexFile);
    indexFile.close();
  }

  request->send(200, "text/plain", "OK");
}

void RecipeService::activateRecipe(AsyncWebServerRequest *request)
{
  String idParam = "";
  if (request->hasParam("id"))
  {
    idParam = request->getParam("id")->value();
  }

  if (idParam.length() == 0)
  {
    request->send(400, "text/plain", "Missing id parameter");
    return;
  }

  int id = idParam.toInt();
  String path = getRecipePath(id);
  File recipeFile = _fs->open(path, "r");

  if (!recipeFile)
  {
    request->send(404, "text/plain", "Recipe not found");
    return;
  }

  DynamicJsonDocument doc(MAX_RECIPE_SIZE);
  DeserializationError error = deserializeJson(doc, recipeFile);
  recipeFile.close();

  if (error)
  {
    request->send(500, "text/plain", "Failed to read recipe");
    return;
  }

  JsonObject recipe = doc.as<JsonObject>();
  JsonArray mashSteps = recipe["mashSteps"];
  if (!mashSteps.isNull())
  {
    DynamicJsonDocument mashDoc(MAX_RECIPE_SIZE);
    JsonObject mashRoot = mashDoc.to<JsonObject>();
    mashRoot["st"] = mashSteps;
    File mashFile = _fs->open("/config/mashSettings.json", "w");
    if (mashFile)
    {
      serializeJson(mashDoc, mashFile);
      mashFile.close();
    }
  }

  JsonArray boilSteps = recipe["boilSteps"];
  if (!boilSteps.isNull())
  {
    DynamicJsonDocument boilDoc(MAX_RECIPE_SIZE);
    JsonObject boilRoot = boilDoc.to<JsonObject>();
    boilRoot["st"] = boilSteps;
    File boilFile = _fs->open("/config/boilSettings.json", "w");
    if (boilFile)
    {
      serializeJson(boilDoc, boilFile);
      boilFile.close();
    }
  }

  JsonObject brewSettings = recipe["brewSettings"];
  if (!brewSettings.isNull() && brewSettings.size() > 0)
  {
    File brewFile = _fs->open("/config/brewSettings.json", "w");
    if (brewFile)
    {
      serializeJson(doc["brewSettings"], brewFile);
      brewFile.close();
    }
  }

  request->send(200, "text/plain", "OK");
}
