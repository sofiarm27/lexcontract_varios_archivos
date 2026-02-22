import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, MAIL_PORT, MAIL_SERVER, MAIL_FROM_NAME
import logging

logger = logging.getLogger(__name__)

def send_welcome_email(email_to: str, full_name: str):
    """
    Sends a welcome email to a new user.
    """
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        logger.warning("Email credentials not configured. Skipping welcome email.")
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = "¡Bienvenido a LexContract!"
    message["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
    message["To"] = email_to

    # Create the plain-text and HTML version of your message
    text = f"""
    Hola {full_name},
    
    ¡Bienvenido a LexContract! Tu cuenta ha sido creada exitosamente.
    Ya puedes acceder a la plataforma con tu correo electrónico.
    
    Atentamente,
    El equipo de LexContract
    """
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #D4AF37; text-align: center;">¡Bienvenido a LexContract!</h2>
          <p>Hola <strong>{full_name}</strong>,</p>
          <p>Estamos muy felices de darte la bienvenida a nuestra plataforma. Tu cuenta ha sido creada exitosamente y ya puedes empezar a gestionar tus contratos y clientes con nosotros.</p>
          <p>Para acceder, simplemente utiliza tu correo electrónico: <strong>{email_to}</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/login" style="background-color: #D4AF37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acceder a mi cuenta</a>
          </div>
          <p style="font-size: 0.9em; color: #777;">Si tienes alguna duda, no dudes en contactarnos.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; font-size: 0.8em; color: #999;">&copy; 2026 LexContract. Todos los derechos reservados.</p>
        </div>
      </body>
    </html>
    """

    # Turn these into plain/html MIMEText objects
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    # Add HTML/plain-text parts to MIMEMultipart message
    # The email client will try to render the last part first
    message.attach(part1)
    message.attach(part2)

    try:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()  # Secure the connection
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, email_to, message.as_string())
        logger.info(f"Welcome email sent successfully to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email_to}: {e}")

def send_password_reset_email(email_to: str, full_name: str, reset_link: str):
    """
    Sends a password reset email.
    """
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        logger.warning("Email credentials not configured. Skipping password reset email.")
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = "Restablece tu contraseña - LexContract"
    message["From"] = f"{MAIL_FROM_NAME} <{MAIL_FROM}>"
    message["To"] = email_to

    text = f"""
    Hola {full_name},
    
    Has solicitado restablecer tu contraseña en LexContract.
    Haz clic en el siguiente enlace para crear una nueva contraseña:
    
    {reset_link}
    
    Este enlace expirará en 30 minutos. Si no solicitaste este cambio, puedes ignorar este correo.
    
    Atentamente,
    El equipo de LexContract
    """
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #D4AF37; text-align: center;">Restablecimiento de Contraseña</h2>
          <p>Hola <strong>{full_name}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en LexContract.</p>
          <p>Haz clic en el botón de abajo para elegir una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_link}" style="background-color: #D4AF37; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #3b82f6;">{reset_link}</p>
          <p style="font-size: 0.9em; color: #777; margin-top: 20px;">Este enlace es válido por 30 minutos. Si no solicitaste este cambio, no es necesario realizar ninguna acción.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="text-align: center; font-size: 0.8em; color: #999;">&copy; 2026 LexContract. Todos los derechos reservados.</p>
        </div>
      </body>
    </html>
    """

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(MAIL_SERVER, MAIL_PORT) as server:
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(MAIL_FROM, email_to, message.as_string())
        logger.info(f"Password reset email sent to {email_to}")
    except Exception as e:
        logger.error(f"Failed to send password reset email to {email_to}: {e}")
