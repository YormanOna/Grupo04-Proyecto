"""
Utilidad para generar recetas médicas y comprobantes de cita en PDF
Diseño profesional con membrete y formato médico estándar
RF-001: Incluye generación de comprobantes con código QR
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
import qrcode
from PIL import Image as PILImage

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


def generar_comprobante_cita_pdf(cita, paciente, medico=None):
    """
    Genera un comprobante de cita médica con código QR (RF-001)
    
    Args:
        cita: Objeto Cita con información de la cita
        paciente: Objeto Paciente
        medico: Objeto Medico/Empleado (opcional)
    
    Returns:
        BytesIO: Buffer con el PDF generado
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=50, bottomMargin=50)
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Estilo para título
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#0066cc'),
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para subtítulos
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#666666'),
        spaceAfter=20,
        alignment=TA_CENTER
    )
    
    # Estilo para etiquetas
    label_style = ParagraphStyle(
        'Label',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#666666'),
        fontName='Helvetica-Bold'
    )
    
    # Estilo para valores
    value_style = ParagraphStyle(
        'Value',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica'
    )
    
    # ENCABEZADO
    elements.append(Paragraph('🏥 COMPROBANTE DE CITA MÉDICA', title_style))
    elements.append(Paragraph('Sistema de Gestión Médica - Hospital', subtitle_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Generar código QR con información de la cita
    qr_data = f"CITA-{cita.id}|PACIENTE-{paciente.cedula}|FECHA-{cita.fecha.strftime('%Y%m%d%H%M')}"
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Guardar QR en buffer
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    
    # Información de la cita con QR a la derecha
    fecha_formateada = cita.fecha.strftime("%d/%m/%Y")
    hora_formateada = cita.hora_inicio or cita.fecha.strftime("%H:%M")
    
    info_cita = [
        [Paragraph('<b>Código de Cita:</b>', label_style), f'#{cita.id}'],
        [Paragraph('<b>Fecha:</b>', label_style), fecha_formateada],
        [Paragraph('<b>Hora:</b>', label_style), hora_formateada],
        [Paragraph('<b>Estado:</b>', label_style), cita.estado.upper()],
    ]
    
    if cita.sala_asignada:
        info_cita.append([Paragraph('<b>Sala:</b>', label_style), cita.sala_asignada])
    
    if cita.tipo_cita:
        info_cita.append([Paragraph('<b>Tipo:</b>', label_style), cita.tipo_cita.title()])
    
    # Tabla con info y QR
    qr_image = Image(qr_buffer, width=1.5*inch, height=1.5*inch)
    
    info_table = Table(info_cita, colWidths=[1.5*inch, 2*inch])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    main_table = Table([[info_table, qr_image]], colWidths=[3.5*inch, 2.5*inch])
    main_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 2, colors.HexColor('#0066cc')),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f8ff')),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
    ]))
    elements.append(main_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # DATOS DEL PACIENTE
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#0066cc'),
        spaceAfter=10,
        fontName='Helvetica-Bold'
    )
    
    elements.append(Paragraph('📋 DATOS DEL PACIENTE', section_style))
    
    paciente_info = [
        [Paragraph('<b>Nombre Completo:</b>', label_style), f'{paciente.nombre} {paciente.apellido}'],
        [Paragraph('<b>Cédula:</b>', label_style), str(paciente.cedula)],
        [Paragraph('<b>Teléfono:</b>', label_style), paciente.telefono or 'No registrado'],
        [Paragraph('<b>Email:</b>', label_style), paciente.email or 'No registrado'],
    ]
    
    if paciente.fecha_nacimiento:
        edad = calcular_edad(paciente.fecha_nacimiento)
        paciente_info.append([Paragraph('<b>Edad:</b>', label_style), edad])
    
    paciente_table = Table(paciente_info, colWidths=[1.5*inch, 4.5*inch])
    paciente_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(paciente_table)
    elements.append(Spacer(1, 0.3*inch))
    
    # DATOS DEL MÉDICO
    if medico:
        elements.append(Paragraph('👨‍⚕️ DATOS DEL MÉDICO', section_style))
        
        medico_info = [
            [Paragraph('<b>Médico:</b>', label_style), f'Dr(a). {medico.nombre} {medico.apellido}'],
        ]
        
        if hasattr(medico, 'especialidad') and medico.especialidad:
            medico_info.append([Paragraph('<b>Especialidad:</b>', label_style), medico.especialidad])
        
        medico_table = Table(medico_info, colWidths=[1.5*inch, 4.5*inch])
        medico_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cccccc')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(medico_table)
        elements.append(Spacer(1, 0.3*inch))
    
    # MOTIVO DE LA CITA
    if cita.motivo:
        elements.append(Paragraph('📝 MOTIVO DE LA CONSULTA', section_style))
        motivo_paragraph = Paragraph(cita.motivo, value_style)
        motivo_table = Table([[motivo_paragraph]], colWidths=[6*inch])
        motivo_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc')),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fffbeb')),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(motivo_table)
        elements.append(Spacer(1, 0.3*inch))
    
    # INSTRUCCIONES
    elements.append(Spacer(1, 0.3*inch))
    instrucciones_style = ParagraphStyle(
        'Instrucciones',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#666666'),
        alignment=TA_CENTER,
        leading=14
    )
    
    elements.append(Paragraph(
        '═══════════════════════════════════════════════<br/>'
        '<b>INSTRUCCIONES IMPORTANTES</b><br/>'
        '• Llegar 15 minutos antes de la hora programada<br/>'
        '• Traer documento de identidad y carnet de seguro<br/>'
        '• Presentar este comprobante en recepción<br/>'
        '• Para cancelar o reprogramar, contactar con 24h de anticipación<br/>'
        '═══════════════════════════════════════════════',
        instrucciones_style
    ))
    
    # PIE DE PÁGINA
    elements.append(Spacer(1, 0.3*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER
    )
    
    fecha_emision = datetime.now().strftime("%d/%m/%Y %H:%M")
    elements.append(Paragraph(
        f'Documento generado el {fecha_emision}<br/>'
        'Sistema de Gestión Médica - Todos los derechos reservados',
        footer_style
    ))
    
    # Construir PDF
    doc.build(elements)
    
    buffer.seek(0)
    return buffer
