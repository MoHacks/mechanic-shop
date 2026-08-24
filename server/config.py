from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_SID: str
    ANTHROPIC_KEY: str
    ALLOWED_NUMBERS: str = ""  # comma-separated E.164 numbers e.g. +15551234567,+447911123456

    class Config:
        env_file = ".env"

settings = Settings()


# from dotenv import load_dotenv
# load_dotenv()  # Now DATABASE_URL will be in os.environ

