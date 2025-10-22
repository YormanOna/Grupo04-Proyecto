"""
Utilidad para generar recetas médicas en PDF
Diseño profesional con membrete y formato médico estándar
"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime

def generar_receta_pdf(receta, paciente, medico):
    """
    Genera un PDF de receta médica con diseño profesional
    
    Args:
        receta: Objeto Receta con la información de prescripción
        paciente: Objeto Paciente con datos del paciente
        medico: Objeto Empleado/Medico con datos del médico
    
    Returns:
        BytesIO: Buffer con el PDF generado
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Container para los elementos del PDF
    elements = []
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Estilo personalizado para el título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para subtítulos
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#059669'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para texto normal
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6
    )
    
    # ENCABEZADO - Membrete del establecimiento
    header_data = [
        ['🏥 SISTEMA DE GESTIÓN MÉDICA', ''],
        ['Centro Médico Integral', f'Receta N° {receta.id}'],
        ['Tel: (02) 123-4567 | Email: info@hospital.com', f'Fecha: {receta.fecha_emision.strftime("%d/%m/%Y %H:%M")}']
    ]
    
    header_table = Table(header_data, colWidths=[4*inch, 2.5*inch])
    header_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (0, 0), 16),
        ('TEXTCOLOR', (0, 0), (0, 0), colors.HexColor('#1e40af')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # Línea separadora
    line_data = [['─' * 90]]
    line_table = Table(line_data, colWidths=[6.5*inch])
    line_table.setStyle(TableStyle([
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#d1d5db')),
    ]))
    elements.append(line_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # DATOS DEL PACIENTE
    elements.append(Paragraph('📋 DATOS DEL PACIENTE', subtitle_style))
    
    paciente_data = [
        ['Nombre:', f'{paciente.nombre} {paciente.apellido}', 'Cédula:', str(paciente.cedula)],
        ['Edad:', calcular_edad(paciente.fecha_nacimiento) if paciente.fecha_nacimiento else 'N/A', 
         'Género:', paciente.genero or 'N/A'],
        ['Dirección:', paciente.direccion or 'N/A', 'Teléfono:', paciente.telefono or 'N/A'],
    ]
    
    if paciente.alergias:
        paciente_data.append(['⚠️ Alergias:', paciente.alergias, '', ''])
    
    paciente_table = Table(paciente_data, colWidths=[1.2*inch, 2.3*inch, 1*inch, 2*inch])
    paciente_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f3f4f6')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#f3f4f6')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(paciente_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # PRESCRIPCIÓN MÉDICA
    elements.append(Paragraph('💊 PRESCRIPCIÓN MÉDICA', subtitle_style))
    
    # Medicamentos - En un cuadro destacado
    medicamentos_style = ParagraphStyle(
        'Medicamentos',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        leftIndent=10,
        fontName='Helvetica'
    )
    
    medicamentos_text = receta.medicamentos.replace('\n', '<br/>')
    medicamentos_paragraph = Paragraph(medicamentos_text, medicamentos_style)
    
    medicamentos_table = Table([[medicamentos_paragraph]], colWidths=[6.5*inch])
    medicamentos_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef3c7')),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#f59e0b')),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    elements.append(medicamentos_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # INDICACIONES
    if receta.indicaciones:
        elements.append(Paragraph('📝 INDICACIONES', subtitle_style))
        indicaciones_paragraph = Paragraph(receta.indicaciones.replace('\n', '<br/>'), normal_style)
        indicaciones_table = Table([[indicaciones_paragraph]], colWidths=[6.5*inch])
        indicaciones_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#dbeafe')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#3b82f6')),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(indicaciones_table)
        elements.append(Spacer(1, 0.3*inch))
    
    # DATOS DEL MÉDICO Y FIRMA
    elements.append(Spacer(1, 0.5*inch))
    
    firma_data = [
        ['', ''],
        ['', ''],
        ['', '________________________________'],
        ['', f'Dr(a). {medico.nombre} {medico.apellido}'],
        ['', f'Cédula: {medico.cedula}'],
        ['', medico.cargo or 'Médico'],
    ]
    
    firma_table = Table(firma_data, colWidths=[3*inch, 3.5*inch])
    firma_table.setStyle(TableStyle([
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('FONTNAME', (1, 3), (1, 3), 'Helvetica-Bold'),
        ('FONTSIZE', (1, 2), (1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(firma_table)
    
    # PIE DE PÁGINA
    elements.append(Spacer(1, 0.3*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER
    )
    elements.append(Paragraph(
        '═══════════════════════════════════════════════════════════════<br/>'
        'Esta receta es válida por 30 días desde la fecha de emisión.<br/>'
        'Conservar en lugar fresco y seco. Mantener fuera del alcance de los niños.',
        footer_style
    ))
    
    # Construir PDF
    doc.build(elements)
    
    buffer.seek(0)
    return buffer

def calcular_edad(fecha_nacimiento):
    """Calcula la edad a partir de la fecha de nacimiento"""
    if not fecha_nacimiento:
        return "N/A"
    
    hoy = datetime.now().date()
    if isinstance(fecha_nacimiento, datetime):
        fecha_nacimiento = fecha_nacimiento.date()
    
    edad = hoy.year - fecha_nacimiento.year
    if hoy.month < fecha_nacimiento.month or (hoy.month == fecha_nacimiento.month and hoy.day < fecha_nacimiento.day):
        edad -= 1
    
    return f"{edad} años"
