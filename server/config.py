from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_SID: str

    class Config:
        env_file = ".env"

settings = Settings()


# from dotenv import load_dotenv
# load_dotenv()  # Now DATABASE_URL will be in os.environ

