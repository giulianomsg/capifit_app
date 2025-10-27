import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PortfolioTab = ({ className = "" }) => {
  const [portfolioItems, setPortfolioItems] = useState([
  {
    id: 1,
    type: 'transformation',
    title: 'Transformação - Maria Santos',
    description: 'Perda de 15kg em 6 meses com treino funcional e dieta personalizada',
    beforeImage: "https://images.unsplash.com/photo-1682530677286-bb99cf3f3ff4",
    beforeImageAlt: 'Mulher antes da transformação física em roupas esportivas',
    afterImage: "https://images.unsplash.com/photo-1671477856137-c23c7a61265d",
    afterImageAlt: 'Mulher após transformação física mostrando resultado do treino',
    date: '2024-09-15',
    clientConsent: true,
    featured: true
  },
  {
    id: 2,
    type: 'transformation',
    title: 'Ganho de Massa - Carlos Oliveira',
    description: 'Ganho de 8kg de massa muscular em 8 meses',
    beforeImage: "https://images.unsplash.com/photo-1669751842835-367ac681ef21",
    beforeImageAlt: 'Homem magro antes do treino de ganho de massa muscular',
    afterImage: "https://images.unsplash.com/photo-1669751842835-367ac681ef21",
    afterImageAlt: 'Homem musculoso após programa de ganho de massa',
    date: '2024-08-20',
    clientConsent: true,
    featured: false
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Certificação CREF Renovada',
    description: 'Renovação da certificação profissional CREF',
    image: "https://images.unsplash.com/photo-1518604100146-5d90d05f1b58",
    imageAlt: 'Certificado profissional CREF sobre mesa de escritório',
    date: '2024-10-01',
    featured: false
  }]
  );

  const [testimonials, setTestimonials] = useState([
  {
    id: 1,
    clientName: 'Maria Santos',
    rating: 5,
    comment: `O João é um excelente profissional! Em 6 meses consegui perder 15kg e ganhar muito condicionamento físico. 
      Ele sempre foi muito atencioso e adaptou os treinos conforme minha evolução. Recomendo muito!`,
    date: '2024-09-20',
    clientPhoto: "https://images.unsplash.com/photo-1634033682496-94b2659f35bd",
    clientPhotoAlt: 'Foto de perfil da cliente Maria Santos sorrindo'
  },
  {
    id: 2,
    clientName: 'Carlos Oliveira',
    rating: 5,
    comment: `Treino com o João há 8 meses e os resultados são incríveis. Ganhei 8kg de massa muscular e me sinto muito mais forte. 
      O acompanhamento nutricional também foi fundamental para o sucesso.`,
    date: '2024-08-25',
    clientPhoto: "https://images.unsplash.com/photo-1630414952473-8effb78d147a",
    clientPhotoAlt: 'Foto de perfil do cliente Carlos Oliveira em ambiente profissional'
  },
  {
    id: 3,
    clientName: 'Ana Costa',
    rating: 5,
    comment: `Melhor personal que já tive! Muito dedicado, pontual e sempre motivando. 
      Os treinos são desafiadores mas nunca impossíveis. Já indiquei para várias amigas.`,
    date: '2024-07-10',
    clientPhoto: "https://images.unsplash.com/photo-1692073634685-99d014ee1499",
    clientPhotoAlt: 'Foto de perfil da cliente Ana Costa em ambiente descontraído'
  }]
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState('transformation');
  const [formData, setFormData] = useState({
    type: 'transformation',
    title: '',
    description: '',
    beforeImage: null,
    afterImage: null,
    image: null,
    clientConsent: false,
    featured: false
  });

  const handleAddNew = (type) => {
    setFormType(type);
    setFormData({
      type,
      title: '',
      description: '',
      beforeImage: null,
      afterImage: null,
      image: null,
      clientConsent: false,
      featured: false
    });
    setShowAddForm(true);
  };

  const handleSaveItem = () => {
    const newItem = {
      id: Date.now(),
      ...formData,
      date: new Date()?.toISOString()?.split('T')?.[0]
    };

    setPortfolioItems((prev) => [...prev, newItem]);
    setShowAddForm(false);
  };

  const handleDeleteItem = (id) => {
    setPortfolioItems((prev) => prev?.filter((item) => item?.id !== id));
  };

  const handleToggleFeatured = (id) => {
    setPortfolioItems((prev) => prev?.map((item) =>
    item?.id === id ? { ...item, featured: !item?.featured } : item
    ));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
    <Icon
      key={i}
      name="Star"
      size={16}
      className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} />

    );
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Portfólio e Depoimentos
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mostre seus resultados e conquistas profissionais
        </p>
      </div>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleAddNew('transformation')}
          iconName="Plus"
          iconPosition="left"
          variant="outline">

          Adicionar Transformação
        </Button>
        
        <Button
          onClick={() => handleAddNew('achievement')}
          iconName="Award"
          iconPosition="left"
          variant="outline">

          Adicionar Conquista
        </Button>
      </div>
      {/* Add Form */}
      {showAddForm &&
      <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {formType === 'transformation' ? 'Nova Transformação' : 'Nova Conquista'}
          </h3>
          
          <div className="space-y-4">
            <Input
            label="Título"
            type="text"
            value={formData?.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e?.target?.value }))}
            placeholder="Título da transformação ou conquista"
            required />

            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descrição
              </label>
              <textarea
              value={formData?.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e?.target?.value }))}
              placeholder="Descreva os resultados alcançados..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none" />

            </div>
            
            {formType === 'transformation' ?
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
              label="Foto Antes"
              type="file"
              accept="image/*"
              onChange={(e) => setFormData((prev) => ({ ...prev, beforeImage: e?.target?.files?.[0] }))} />

                
                <Input
              label="Foto Depois"
              type="file"
              accept="image/*"
              onChange={(e) => setFormData((prev) => ({ ...prev, afterImage: e?.target?.files?.[0] }))} />

              </div> :

          <Input
            label="Imagem"
            type="file"
            accept="image/*"
            onChange={(e) => setFormData((prev) => ({ ...prev, image: e?.target?.files?.[0] }))} />

          }
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                type="checkbox"
                checked={formData?.clientConsent}
                onChange={(e) => setFormData((prev) => ({ ...prev, clientConsent: e?.target?.checked }))}
                className="rounded border-border" />

                <span className="text-sm text-foreground">
                  {formType === 'transformation' ? 'Cliente autorizou uso das imagens' : 'Autorizado para divulgação'}
                </span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                type="checkbox"
                checked={formData?.featured}
                onChange={(e) => setFormData((prev) => ({ ...prev, featured: e?.target?.checked }))}
                className="rounded border-border" />

                <span className="text-sm text-foreground">Destacar no perfil</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
            variant="outline"
            onClick={() => setShowAddForm(false)}>

              Cancelar
            </Button>
            
            <Button
            onClick={handleSaveItem}
            iconName="Save"
            iconPosition="left">

              Salvar
            </Button>
          </div>
        </div>
      }
      {/* Portfolio Items */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Transformações e Conquistas
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {portfolioItems?.map((item) =>
          <div
            key={item?.id}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icon
                  name={item?.type === 'transformation' ? 'TrendingUp' : 'Award'}
                  size={20}
                  className="text-primary" />

                  <h4 className="font-semibold text-foreground">{item?.title}</h4>
                  {item?.featured &&
                <span className="px-2 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                      Destaque
                    </span>
                }
                </div>
                
                <div className="flex space-x-1">
                  <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleFeatured(item?.id)}>

                    <Icon name={item?.featured ? "Star" : "StarOff"} size={16} />
                  </Button>
                  
                  <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteItem(item?.id)}
                  className="text-destructive hover:text-destructive">

                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {item?.description}
              </p>
              
              {item?.type === 'transformation' ?
            <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Antes</p>
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                    src={item?.beforeImage}
                    alt={item?.beforeImageAlt}
                    className="w-full h-full object-cover" />

                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Depois</p>
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                    src={item?.afterImage}
                    alt={item?.afterImageAlt}
                    className="w-full h-full object-cover" />

                    </div>
                  </div>
                </div> :

            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image
                src={item?.image}
                alt={item?.imageAlt}
                className="w-full h-full object-cover" />

                </div>
            }
              
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>{new Date(item.date)?.toLocaleDateString('pt-BR')}</span>
                {item?.clientConsent &&
              <span className="flex items-center">
                    <Icon name="Check" size={12} className="mr-1 text-success" />
                    Autorizado
                  </span>
              }
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Testimonials */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">
          Depoimentos de Clientes
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {testimonials?.map((testimonial) =>
          <div
            key={testimonial?.id}
            className="bg-card border border-border rounded-lg p-6">

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <Image
                  src={testimonial?.clientPhoto}
                  alt={testimonial?.clientPhotoAlt}
                  className="w-full h-full object-cover" />

                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">
                      {testimonial?.clientName}
                    </h4>
                    <div className="flex space-x-1">
                      {renderStars(testimonial?.rating)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    "{testimonial?.comment}"
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {new Date(testimonial.date)?.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {portfolioItems?.length === 0 &&
      <div className="text-center py-12">
          <Icon name="Image" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum item no portfólio
          </h3>
          <p className="text-muted-foreground mb-4">
            Adicione transformações e conquistas para mostrar seu trabalho
          </p>
          <Button
          onClick={() => handleAddNew('transformation')}
          iconName="Plus"
          iconPosition="left">

            Adicionar Primeira Transformação
          </Button>
        </div>
      }
    </div>);

};

export default PortfolioTab;