import sys
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def download_webpage(url):
    response = requests.get(url)
    if response.status_code == 200:
        with open('downloaded_page.html', 'w', encoding='utf-8') as file:
            file.write(response.text)
        print("Webpage downloaded successfully.")
    else:
        print(f"Failed to download webpage. Status code: {response.status_code}")

def render_and_screenshot(url):
    options = Options()
    options.headless = True
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get(url)
    driver.save_screenshot('webpage_screenshot.png')
    driver.quit()
    print("Screenshot saved successfully.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    download_webpage(url)